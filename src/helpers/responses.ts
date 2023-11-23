function randomNumberMax(maximum: number): number {
    return Math.floor(Math.random() * maximum);
}

export function getRandomEmptyMessage(): string {
    const emptyMessages = [
        "Hmm... there's nothing here... did you even add anything?",
        "There's nothing here yet... did you even add anything?",
        "Nothing found... did you even add anything?"
    ];
    return emptyMessages[randomNumberMax(emptyMessages.length)];
}

export function getRandomLevelUpMessage(level: number): string {
    const levelUpMessages = [
        `Congrats! You're now level ${level}!`,
        `You're now level ${level}! Nice!`,
        `Wow... you're level ${level}! (...and then everyone clapped!)`
    ];
    return levelUpMessages[randomNumberMax(levelUpMessages.length)];
}
