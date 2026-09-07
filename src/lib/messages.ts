export const lightMessages = [
    "Você não sai da minha cabeça hoje.",
    "Tô pensando em você agora mesmo.",
    "Meu dia fica melhor quando lembro da gente.",
    "Queria estar do seu lado neste momento.",
    "Me manda um oi quando puder.",
    "Você é meu pensamento favorito do dia.",
];

export const heatMessages = [
    "Hoje eu quero toda a sua atenção.",
    "Tenho planos perigosamente bons para nós dois.",
    "Você sabe exatamente como me deixar sem juízo.",
    "Não vejo a hora de ficar a sós com você.",
    "Guarde um pouco de energia para mim.",
    "Essa saudade está ficando difícil de disfarçar.",
];

export function randomMessage(messages: string[]) {
    return messages[Math.floor(Math.random() * messages.length)];
}
