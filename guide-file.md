## Introdução
App que representa os hábitos como cards que podem ser posicionados com drag-drop em cada um dos blocos a seguir: Inbox, Active, Archieve. O objetivo desse app é dar um panorama ao usuário dos hábitos que deveriam estar ocupando a mente dele para o ajudar a não perder o foco.

## UI
#### Estilo
Aparência: 
- escura
- cores vívidas
Elementos sólidos(com background visível):
- background escuro e 80% opaco com efeito de blur em relação ao fundo.
- borda branca sólida e bem arredondada
Texto:
- Fonte Poppins
- Cor Branca
Ícones:
- Minimalistas
#### Layout
- Página principal: bloco Inbox ocupando 1/8 da página logo acima do bloco Archieve que ocupa 1/8 da página. Ambos os blocos formando 2/8 da página estão posicionados à esquerda de um grande bloco que ocupa 6/8 da página. Na parte superior do software há um menu com algumas opções, tendo, inicialmente apenas um botão representado por uma lixeira, que leva ao bloco em popup de deletados.
- Cards: Cada card(hábito) pode ser movido de um bloco para o outro e um card pode substituir outro se ao arrastar foi posicionado sobre outro card. Cada card(hábito) tem um título, um porquê(espaço de texto onde o usuário pode discorrer sobre a razão de aquele hábito ser importante para ele), um projeto atrelado, uma contagem regressiva(pode ser nula, isso é explicado na seção de **UX**) e um histórico de estados.
- Blocos: Cada bloco possui um botão de adicionar hábito representado por um "+", ao ser clicado, abre o popup de adicionar hábito com o input "Bloco" pre-preenchido com o valor do respectivo bloco. Os blocos tem scroll interno.
- Popup Projetos: lista os projetos dividos em duas áreas: ativos e não ativos. Do lado esquerdo estão os projetos não ativos em coloração neutra e do lado direito estão os projetos ativos com coloração azulada. Cada projeto nas duas listas é mostrado o seu nome ao lado da quantidade de cards atrelados a ele.
- Popup Deletados: similar aos outros blocos mas os cards não podem ser arrastados. Os cards tem cada um, um botão de restauração para estado anterior.
- Popup Adicionar Card: título do hábito*, porquê, projeto atrelado, bloco de destino(já pre-preenchido com o bloco cujo botão foi responsável por abrir o popup)
- Popup de Substituição de card: momento da Substituição(instantâneo(padrão) ou especificar o dia), duração da substituição(indefinido(padrão) ou especificar dia).
- Popup de Confirmação de Substituição: Pergunta ao usuário se deseja "prorrogar substituição ou realizar a substituição ou cancelar substituição".

#### UX
Substituição de cards: ao arrastar um card X sobre um Y consideramos que estamos substituindo Y por X. Ao "realizar o arrasto" o popup de substituição deve aparecer. Se o usuário especificou um momento de substituição, o software deve adicionar uma contagem regressiva de dias no card Y e quando ela chegar ao fim abrir um popup de confirmação de substituição. se o usuário especificou uma duração, no momento da substituição será iniciada uma contagem regressiva de dias com o tempo da duração no card X. 
Adição dos Cards: ao clicar no menu de projeto atrelado o usuário pode selecionar um dos projetos existentes no menu ou adicionar um(botão no fim da lista).