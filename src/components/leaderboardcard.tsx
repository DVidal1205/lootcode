import { GUser } from "~/app/game/utility";

interface LParams {
    user: GUser,
    place: number
}

export default function LeaderboardCard({ user, place }: LParams) {

    return (
        <span className={`flex flex-row gap-2 justify-between p-4 m-4 ${place <= 3 ? "text-yellow-300" : place <= 25 ? "text-[#c0c0c0]"  : place <= 100 ? "text-[#CD7F32]" : "text-purple-500"} border-purple-400 border-4 border-double rounded-xl items-center overflow-scroll`}>
                <b>{place}{findExt(place)}</b>
                <b className="w-[20%] overflow-clip">{user.name}</b>
                <p>Solves: {user.score}</p>
                <p>{(user.time.getMonth()+1)+"/"+user.time.getDate()+"/"+user.time.getFullYear()} at {user.time.getHours()} hours and {user.time.getMinutes()} mins</p>
        </span>
    )
}

function findExt(i: number) {
    let ext = "";
    if ((i) % 100 > 10 && (i) % 100 < 20) {
        ext += "th";
    } else {
        switch((i) % 10) {
            case 1: ext += "st";
            break;
            case 2: ext += "nd";
            break;
            case 3: ext += "rd";
            break;
            default: ext += "th";
        }
    }
    return ext;
}