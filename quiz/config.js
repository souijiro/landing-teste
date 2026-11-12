/* =========================================================================
   QUIZ DIAGNÓSTICO DA CONFEITEIRA — CONFIGURAÇÃO
   Tudo o que pode mudar (textos, perguntas, pontos, perfis, links) fica aqui.
   ========================================================================= */
window.QUIZ_CONFIG = {
  // ---- Links (não inventar: preencher com o endereço real) ----------------
  // Página de captação da aula. Só aparece quando o link tem ?captacao=sim
  AULA_URL: "",
  // Política de Privacidade da Docis (link discreto no rodapé; vazio = oculto)
  PRIVACIDADE_URL: "",
  // Endereço público do quiz (usado na mensagem de compartilhamento)
  QUIZ_URL: "https://c.docis.com.br/quiz",

  // ---- Lembrete na agenda (quando NÃO tem ?captacao=sim) ------------------
  // Aula gratuita semanal: dia da semana (0=domingo, 1=segunda...) e hora de Brasília
  AGENDA: {
    diaSemana: 1,
    hora: 19,
    minuto: 0,
    duracaoMin: 120,
    titulo: "Aula gratuita da Docis 🍫",
    descricao: "Aula gratuita da Ci com técnicas e estratégias para produzir brigadeiros incríveis e vender todos os dias. O link de acesso chega pelo WhatsApp.",
    // Se a aula já começou há mais de X minutos, o lembrete vai para a semana seguinte
    toleranciaMin: 30,
  },

  // ---- Supabase (chave publicável; a função só grava e-mail/telefone) ----
  SUPABASE_URL: "https://eoqyoeohbcpdjxghfwua.supabase.co",
  SUPABASE_KEY: "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98",
  SUPABASE_RPC: "quiz_lead_salvar",

  // ---- Perguntas ----------------------------------------------------------
  // pontos: [A, B, C, D]. area: tecnica | gestao | vendas | null (não pontua)
  PERGUNTAS: [
    { area: null, categoria: "estágio atual", pontos: null,
      texto: "Hoje, qual é a sua maior dificuldade na confeitaria?",
      opcoes: [
        "Quero começar, mas não sei por onde.",
        "Faço doces, mas ainda não tenho segurança nas receitas.",
        "Meus doces são bons, mas tenho dificuldade para vender.",
        "Já vendo, mas quero crescer e ganhar mais dinheiro.",
      ] },
    { area: "tecnica", categoria: "produção", pontos: [0, 1, 2, 3],
      texto: "Se você recebesse uma encomenda de 100 brigadeiros para amanhã, como se sentiria?",
      opcoes: [
        "Desesperada! Não saberia nem por onde começar.",
        "Aceitaria, mas teria medo de errar o ponto ou a quantidade.",
        "Conseguiria produzir, mas ficaria preocupada com o lucro.",
        "Tranquila! Sei produzir, precificar e entregar.",
      ] },
    { area: "tecnica", categoria: "técnica", pontos: [0, 1, 2, 3],
      texto: "Você sabe por que alguns brigadeiros ficam duros, açucarados ou grudando nas mãos?",
      opcoes: [
        "Não faço ideia do motivo.",
        "Tenho algumas suspeitas, mas não sei corrigir.",
        "Sei resolver alguns desses problemas.",
        "Sei identificar a causa e corrigir cada um deles.",
      ] },
    { area: "tecnica", categoria: "ingredientes", pontos: [0, 0, 2, 3],
      texto: "Na hora de comprar leite condensado e creme de leite, como você escolhe?",
      opcoes: [
        "Pela marca que conheço.",
        "Pelo preço mais barato.",
        "Sei que a gordura importa, mas não sei exatamente quanto.",
        "Analiso a composição e sei escolher os ingredientes certos.",
      ] },
    { area: "tecnica", categoria: "autonomia técnica", pontos: [0, 1, 2, 3],
      texto: "Se você precisasse criar um novo sabor de brigadeiro sem seguir uma receita pronta, conseguiria?",
      opcoes: [
        "Não, dependo totalmente das receitas.",
        "Tentaria, mas teria medo de desperdiçar ingredientes.",
        "Consigo adaptar algumas receitas.",
        "Sim! Tenho domínio da técnica para criar meus próprios sabores.",
      ] },
    { area: "gestao", categoria: "gestão", pontos: [0, 1, 2, 3],
      texto: "Você sabe exatamente quanto lucra em cada caixa de brigadeiros que vende?",
      opcoes: [
        "Ainda não vendo.",
        "Não. Defino o preço olhando a concorrência.",
        "Calculo os ingredientes, mas não sei se considero todos os custos.",
        "Sim, sei meus custos e quanto sobra de lucro.",
      ] },
    { area: "vendas", categoria: "vendas", pontos: [0, 1, 2, 3],
      texto: "Se você precisasse vender 50 brigadeiros até amanhã, o que faria?",
      opcoes: [
        "Não saberia como conseguir clientes tão rápido.",
        "Postaria no Instagram e esperaria alguém comprar.",
        "Mandaria mensagens para alguns conhecidos oferecendo.",
        "Tenho uma estratégia de vendas que conseguiria colocar em prática.",
      ] },
    { area: "vendas", categoria: "vendas", pontos: [0, 1, 2, 3],
      texto: "Quando você oferece seus doces e a pessoa não responde, o que faz?",
      opcoes: [
        "Fico com vergonha e não mando mais nada.",
        "Espero a pessoa responder, mesmo que demore.",
        "Às vezes mando outra mensagem, mas fico insegura.",
        "Sei como fazer um acompanhamento sem incomodar.",
      ] },
    { area: "vendas", categoria: "recorrência", pontos: [0, 1, 2, 3],
      texto: "Quantos dos seus clientes voltam para comprar novamente?",
      opcoes: [
        "Ainda não tenho clientes.",
        "Não sei, nunca acompanhei isso.",
        "Alguns voltam, mas não tenho uma estratégia para isso.",
        "Acompanho meus clientes e faço ações para que comprem novamente.",
      ] },
    { area: "gestao", categoria: "maturidade do negócio", pontos: [0, 1, 2, 3],
      texto: "Se você tivesse que depender exclusivamente da confeitaria para pagar suas contas a partir do próximo mês, como se sentiria?",
      opcoes: [
        "Muito insegura. Ainda não sei por onde começar.",
        "Preocupada. Sei fazer doces, mas não tenho vendas suficientes.",
        "Acredito que conseguiria, mas precisaria melhorar algumas coisas.",
        "Confiante. Já tenho uma estrutura e resultados consistentes.",
      ] },
  ],

  // ---- Perfis (min/max = faixa de pontos, máximo 27) ----------------------
  PERFIS: [
    { min: 0, max: 6, imagem: "img/result-01.webp", nome: "Confeiteira Sonhadora", emoji: "💜",
      titulo: "Você é uma Confeiteira Sonhadora! 💜",
      descricao: "Você tem vontade de transformar a confeitaria em uma fonte de renda, mas ainda precisa descobrir por onde começar e como fazer isso com segurança.",
      mensagem: "Todo negócio começa com um primeiro passo. Aprender as técnicas certas desde o início pode ajudar você a economizar tempo, ingredientes e muitos erros." },
    { min: 7, max: 13, imagem: "img/result-02.webp", nome: "Confeiteira em Desenvolvimento", emoji: "🍫",
      titulo: "Você é uma Confeiteira em Desenvolvimento! 🍫",
      descricao: "Você já deu os primeiros passos, mas ainda existem algumas inseguranças que podem estar atrapalhando seus resultados.",
      mensagem: "Quando você entende os ingredientes e domina as técnicas, deixa de depender tanto da tentativa e erro e começa a produzir com mais confiança." },
    { min: 14, max: 20, imagem: "img/result-03.webp", nome: "Confeiteira que Precisa Destravar", emoji: "✨",
      titulo: "Você é uma Confeiteira que Precisa Destravar! ✨",
      descricao: "Você já tem conhecimentos importantes, mas ainda existem dificuldades que podem estar impedindo suas vendas e seu crescimento.",
      mensagem: "Não basta ter um doce gostoso. Você também precisa saber quanto cobrar, como encontrar clientes e como fazer eles voltarem a comprar." },
    { min: 21, max: 27, imagem: "img/result-04.webp", nome: "Confeiteira em Crescimento", emoji: "🚀",
      titulo: "Você é uma Confeiteira em Crescimento! 🚀",
      descricao: "Você já construiu uma boa base e demonstra segurança em várias áreas da confeitaria.",
      mensagem: "Seu próximo passo é aperfeiçoar processos, ganhar produtividade e criar estratégias para crescer com qualidade e lucro." },
  ],

  // ---- Áreas (ordem = desempate) ------------------------------------------
  AREAS: [
    { id: "tecnica", nome: "Técnica",
      desafio: "Seu maior desafio hoje está no domínio das técnicas e dos ingredientes.",
      recomendacao: "Comece pelo básico bem feito: entenda o papel de cada ingrediente e o ponto certo do brigadeiro. Quando a técnica fica firme, você produz com segurança e para de perder ingredientes." },
    { id: "vendas", nome: "Vendas",
      desafio: "Seu maior desafio hoje está em conseguir clientes e vender com frequência.",
      recomendacao: "Crie uma rotina simples de oferta: uma lista de contatos, mensagens prontas e um acompanhamento gentil. Vender todo dia é método, não sorte." },
    { id: "gestao", nome: "Gestão",
      desafio: "Seu maior desafio hoje está na organização dos custos, do lucro e do crescimento.",
      recomendacao: "Anote todos os custos de uma receita (ingredientes, embalagem, gás, seu tempo) e defina o preço a partir deles. Saber quanto sobra é o que transforma doce em renda." },
  ],

  // Mensagem de compartilhamento ({perfil} = nome do perfil, {url} = QUIZ_URL)
  COMPARTILHAR: "🍫 Acabei de descobrir meu perfil na confeitaria! Sou uma {perfil}! Quer descobrir o seu também? Faça o teste: {url}",
};
