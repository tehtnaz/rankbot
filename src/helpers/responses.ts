function randomNumberMax(maximum: number): number {
    return Math.floor(Math.random() * maximum);
}

export function getRandomEmptyMessage(): string {
    const emptyMessages = [
        "Hmm... there's nothing here... did you even add anything?",
        "There's nothing here yet... did you even add anything?",
        "Nothing found... did you even add anything?",
        "Now you see me, now you don't! (This list is empty!)"
    ];
    return emptyMessages[randomNumberMax(emptyMessages.length)];
}

function levelToXp(lvl: number){
    return (10/6)*lvl*lvl*lvl+(135/6)*lvl*lvl+(455/6)*lvl
}

export function getRandomLevelUpMessage(level: number): string {
    const levelUpMessages = [
        `Level up! You're level ${level}`,
        `Congrats! You're now level ${level}!`, 
        `Wow... you're level ${level}! (...and then everyone clapped!)`,
        `You're now level ${level}! Nice!`,
        `After only ${levelToXp(level)}xp, can you believe it? You're now level ${level}!`,
        `Chattin' chattin', all day long (You're now level ${level}!)`,
        `Feeling old yet? (You're now level ${level}!)`
    ];
    return levelUpMessages[randomNumberMax(levelUpMessages.length - 2) + (level > 10 ? 2 : (level > 5 ? 1 : 0))];
}
