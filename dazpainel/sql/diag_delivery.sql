-- Diagnóstico do Delivery (c.docis.com.br/daz/diagnosticododelivery) + painel (c.docis.com.br/daz/painel)
-- Supabase "Docis Controles" (eoqyoeohbcpdjxghfwua). Este arquivo não é servido (rota 404 + .vercelignore).

create table if not exists public.diag_delivery_leads (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- respostas do quiz
  plataformas text[] not null default '{}',          -- ifood | 99food | keeta | nenhum
  faturamento text,                                   -- 0 | ate_2k | 2k_5k | 5k_10k | 10k_30k | 30k_50k | 50k_mais
  momento text,                                       -- segunda_renda | vivo_do_delivery | iniciando
  whatsapp text not null,                             -- 55 + DDD + número
  nome text not null,
  origem jsonb not null default '{}',                 -- utm_* / src / sck da URL
  pagina text,
  respostas_anteriores jsonb not null default '[]',   -- se a pessoa responder de novo, guarda a versão antiga
  -- controle comercial (só o painel mexe)
  status text not null default 'novo'
    check (status in ('novo','contatado','agendado','realizado','fechado','perdido','desqualificado')),
  agendado_para timestamptz,
  responsavel text,
  produto text,
  ticket numeric(12,2),
  fechado_em date,
  motivo_perda text,
  pagamento_status text not null default 'pendente'
    check (pagamento_status in ('pendente','parcial','pago','reembolsado')),
  pagamento_forma text,
  valor_pago numeric(12,2),
  parcelas int,
  obs text
);
create unique index if not exists diag_delivery_leads_whats_uk on public.diag_delivery_leads (whatsapp);
create index if not exists diag_delivery_leads_criado_idx on public.diag_delivery_leads (criado_em desc);

alter table public.diag_delivery_leads enable row level security;
revoke all on public.diag_delivery_leads from anon, authenticated;

-- Entrada pública do quiz (anon). Mesmo WhatsApp respondendo de novo → atualiza respostas, mantém o controle comercial.
create or replace function public.diag_delivery_salvar(p jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tel text := regexp_replace(coalesce(p->>'whatsapp',''), '\D', '', 'g');
  v_nome text := left(btrim(regexp_replace(coalesce(p->>'nome',''), '\s+', ' ', 'g')), 80);
  v_plat text[];
  v_fat text := p->>'faturamento';
  v_mom text := p->>'momento';
  v_origem jsonb := '{}';
  k text;
begin
  if length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;
  if v_tel !~ '^55[1-9][0-9]9[0-9]{8}$' then raise exception 'whatsapp invalido'; end if;
  if length(v_nome) < 2 then raise exception 'nome invalido'; end if;

  select coalesce(array_agg(distinct x), '{}') into v_plat
    from jsonb_array_elements_text(coalesce(p->'plataformas','[]')) x
   where x in ('ifood','99food','keeta','nenhum');
  if v_fat not in ('0','ate_2k','2k_5k','5k_10k','10k_30k','30k_50k','50k_mais') then v_fat := null; end if;
  if v_mom not in ('segunda_renda','vivo_do_delivery','iniciando') then v_mom := null; end if;

  foreach k in array array['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck','fbclid','gclid'] loop
    if jsonb_typeof(p->'origem'->k) = 'string' then
      v_origem := v_origem || jsonb_build_object(k, left(p->'origem'->>k, 200));
    end if;
  end loop;

  insert into diag_delivery_leads (plataformas, faturamento, momento, whatsapp, nome, origem, pagina)
  values (v_plat, v_fat, v_mom, v_tel, v_nome, v_origem, left(p->>'pagina', 120))
  on conflict (whatsapp) do update set
    respostas_anteriores = diag_delivery_leads.respostas_anteriores || jsonb_build_array(jsonb_build_object(
      'em', diag_delivery_leads.criado_em, 'nome', diag_delivery_leads.nome, 'plataformas', diag_delivery_leads.plataformas,
      'faturamento', diag_delivery_leads.faturamento, 'momento', diag_delivery_leads.momento)),
    plataformas = excluded.plataformas, faturamento = excluded.faturamento, momento = excluded.momento,
    nome = excluded.nome, origem = excluded.origem || diag_delivery_leads.origem,
    criado_em = now(), atualizado_em = now();
  return true;
end;
$$;
revoke all on function public.diag_delivery_salvar(jsonb) from public;
grant execute on function public.diag_delivery_salvar(jsonb) to anon;

-- Painel: login pelo dash_login (painel 'diagdelivery', mesma senha do /dash). Token = dash_tokens (90 dias).
insert into public.dash_config (chave, senha_hash)
select 'diagdelivery', senha_hash from public.dash_config
 where chave = 'black2026' and not exists (select 1 from public.dash_config where chave = 'diagdelivery');

create or replace function public.diag_token_ok(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or not exists (
    select 1 from dash_tokens where token = p_token and painel = 'diagdelivery' and expira_em > now()
  ) then
    raise exception 'token invalido' using errcode = '28000';
  end if;
end;
$$;
revoke all on function public.diag_token_ok(uuid) from public, anon, authenticated;

create or replace function public.dash_diag_delivery(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform diag_token_ok(p_token);
  return coalesce((select jsonb_agg(to_jsonb(l) order by l.criado_em desc) from diag_delivery_leads l), '[]'::jsonb);
end;
$$;

create or replace function public.dash_diag_delivery_salvar(p_token uuid, p_id uuid, p_campos jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare r diag_delivery_leads;
begin
  perform diag_token_ok(p_token);
  update diag_delivery_leads set
    status           = coalesce(nullif(p_campos->>'status',''), status),
    agendado_para    = (p_campos->>'agendado_para')::timestamptz,
    responsavel      = left(nullif(btrim(p_campos->>'responsavel'),''), 60),
    produto          = left(nullif(btrim(p_campos->>'produto'),''), 80),
    ticket           = (p_campos->>'ticket')::numeric,
    fechado_em       = (p_campos->>'fechado_em')::date,
    motivo_perda     = left(nullif(btrim(p_campos->>'motivo_perda'),''), 120),
    pagamento_status = coalesce(nullif(p_campos->>'pagamento_status',''), pagamento_status),
    pagamento_forma  = left(nullif(p_campos->>'pagamento_forma',''), 20),
    valor_pago       = (p_campos->>'valor_pago')::numeric,
    parcelas         = (p_campos->>'parcelas')::int,
    obs              = left(nullif(btrim(p_campos->>'obs'),''), 4000),
    atualizado_em    = now()
  where id = p_id
  returning * into r;
  if r.id is null then raise exception 'lead nao encontrado'; end if;
  return to_jsonb(r);
end;
$$;

create or replace function public.dash_diag_delivery_apagar(p_token uuid, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform diag_token_ok(p_token);
  delete from diag_delivery_leads where id = p_id;
  return found;
end;
$$;

revoke all on function public.dash_diag_delivery(uuid) from public;
revoke all on function public.dash_diag_delivery_salvar(uuid, uuid, jsonb) from public;
revoke all on function public.dash_diag_delivery_apagar(uuid, uuid) from public;
grant execute on function public.dash_diag_delivery(uuid) to anon;
grant execute on function public.dash_diag_delivery_salvar(uuid, uuid, jsonb) to anon;
grant execute on function public.dash_diag_delivery_apagar(uuid, uuid) to anon;
