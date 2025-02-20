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
        const nextLevel = currUser.level + 1;
        const nextLevelExp = levels.levels[nextLevel.toString() as keyof typeof levels.levels];

        //user's experience should ALWAYS be less than levelExp. This component () does not update the user's level
        if (currUser.experience < nextLevelExp) {
            const expPercent = (currUser.experience / nextLevelExp) * 100;
            setPercentage(expPercent);
            return;
        }
    }, [currUser])

    return (
        <div className="flex flex-row items-center w-full justify-end space-x-2">
            <div className="flex flex-row border-y-blue-100 border-2 w-[60%] h-[0.8rem] rounded-md">
                <div
                    className="bg-neutral-400 rounded-md  text-center"
                    style={{ width: `${percentage}%` }}
                >
                    <p className="text-black text-[7px] font-bold">{percentage ? `${percentage.toFixed(1)}%` : ''}</p>
                </div>
            </div>
            <div className="">
                {currUser && <p className="text-xs font-basicFont">Lvl {currUser.level}</p>}
            </div>
        </div>
    )
}
