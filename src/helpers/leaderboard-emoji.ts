//position is zero-indexed
export function getLeaderboardEmoji(position: number) {
    switch (position + 1) {
        case 1:
            return ":first_place:";
        case 2:
            return ":second_place:";
        case 3:
            return ":third_place:";
        default:
            return "#" + (position + 1).toString();
    }
}
