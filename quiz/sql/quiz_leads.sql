-- Quiz Diagnóstico da Confeiteira (c.docis.com.br/quiz)
-- Guarda SOMENTE e-mail e telefone. Nenhuma resposta, pontuação ou perfil.
-- Supabase "Docis Controles" (eoqyoeohbcpdjxghfwua).

create table if not exists public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  telefone text
);

-- Sem duplicados: um mesmo e-mail ou telefone só aparece uma vez.
create unique index if not exists quiz_leads_email_uk on public.quiz_leads (email) where email is not null;
create unique index if not exists quiz_leads_telefone_uk on public.quiz_leads (telefone) where telefone is not null;

-- RLS ligado e nenhuma policy: ninguém lê nem escreve direto pela API.
alter table public.quiz_leads enable row level security;
revoke all on public.quiz_leads from anon, authenticated;

-- Única porta de entrada: valida, normaliza e evita duplicados.
create or replace function public.quiz_lead_salvar(p_email text default null, p_telefone text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_tel   text;
  v_id_email uuid;
  v_id_tel   uuid;
begin
  -- e-mail: minúsculo, sem espaços, formato básico, até 254 caracteres
  v_email := lower(btrim(coalesce(p_email, '')));
  if length(v_email) > 254 or v_email !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$' then
    v_email := null;
  end if;

  -- telefone: só dígitos; número BR sem DDI (10/11 dígitos) ganha 55
  v_tel := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  if length(v_tel) > 20 then v_tel := ''; end if;
  v_tel := regexp_replace(v_tel, '^0+', '');
  if length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;
  if v_tel ~ '^55' and length(v_tel) not in (12, 13) then v_tel := null;
  elsif length(v_tel) < 10 or length(v_tel) > 15 then v_tel := null;
  end if;

  if v_email is null and v_tel is null then
    return false;
  end if;

  select id into v_id_email from quiz_leads where email = v_email;
  select id into v_id_tel   from quiz_leads where telefone = v_tel;

  if v_id_email is null and v_id_tel is null then
    insert into quiz_leads (email, telefone) values (v_email, v_tel)
    on conflict do nothing;
  elsif v_id_email is not null and v_id_tel is null and v_tel is not null then
    -- já existe pelo e-mail: completa o telefone se estiver vazio
    update quiz_leads set telefone = v_tel where id = v_id_email and telefone is null;
  elsif v_id_tel is not null and v_id_email is null and v_email is not null then
    -- já existe pelo telefone: completa o e-mail se estiver vazio
    update quiz_leads set email = v_email where id = v_id_tel and email is null;
  end if;
  return true;
exception when unique_violation then
  return true; -- corrida entre duas chamadas iguais: o registro já existe
end;
$$;

revoke all on function public.quiz_lead_salvar(text, text) from public;
grant execute on function public.quiz_lead_salvar(text, text) to anon;
