/**
 * @returns
 * Simple progress bar that uses the width to determine the percentage to show the user
 */
import { useEffect, useState } from "react";
import levels from "../assets/levels"
import { useUser } from "./Contexts/userContext"

export default function ProgressBar() {
    const [percentage, setPercentage] = useState<number>(0.0);
    const { currUser } = useUser()

    useEffect(() => {
        if (!currUser) return;
        //Calculate user's percentage of completion of current level
        const nextLevel = currUser.level + 1
        const nextLevelExp = levels.levels[nextLevel.toString() as keyof typeof levels.levels];
        //user's experience should ALWAYS be less than levelExp. This component does not update the user's level
        if (currUser.experience < nextLevelExp) {
            const expPercent = (currUser.experience / nextLevelExp) * 100;
            console.log(expPercent)
            setPercentage(expPercent);
            return;
        }
    }, [currUser])

    return (
        <div className="flex flex-row items-center">
            <div className="flex flex-row border-black border-2 w-[70%] h-[0.8rem] rounded-md">
                {<div className={(percentage || percentage == 0) ? `bg-[#b8ccbd] w-[${percentage}%] rounded-md text-center` : `bg-[#b8ccbd] w-12 rounded-md text-center`}>
                    <p className="text-black text-[7px]">{(percentage) ? `${percentage.toFixed(1)}%` : ''}</p>
                </div>}
            </div>
            <div className="ml-auto">
                {currUser && <p className="text-xs">Lvl {currUser.level}</p>}
            </div>
        </div>
    )
}