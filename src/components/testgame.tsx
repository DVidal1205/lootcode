"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { GUser, getLevel, getUserStats } from "~/app/game/utility";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import mapFile from "~/util/map.json";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Clover,
  CloverIcon,
  HeartIcon,
  ShieldIcon,
  SparkleIcon,
  SwordIcon,
  Loader2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { nameToFileName } from "./mapview";
import { Dialog, DialogContent } from "./ui/dialog";
import ReactMarkdown from "react-markdown";

interface Entity {
  image: string;
  name: string;
  health: number;
  maxHealth: number;
  critChance: number;
  strength: number;
  armor: number;
  magic: number;
  resist: number;
  dead: boolean;
  critHit: boolean;
}

interface Enemy {
  name: string;
  image: string;
  health: number;
  critChance: number;
  strength: number;
  armor: number;
  magic: number;
  resist: number;
}

interface Props {
  name: string;
  user: GUser;
  enc: string;
  reg: string;
}

export default function Testgame({ user, name, enc, reg }: Props) {
  const [enemies, setEnemies] = useState<Entity[] | null>(null);
  const [player, setPlayer] = useState<Entity | null>(null);
  const [originalPlayer, setOriginalPlayer] = useState<Entity | null>(null);
  const [originalEnemies, setOriginalEnemies] = useState<Entity[] | null>(null);
  const [loopRunning, setLoopRunning] = useState<boolean>(false);
  const [encounterLabel, setEncounterLabel] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const userStats = getUserStats(user);

  const { data } = api.code.getProblem.useQuery({
    name: enc,
    region: reg,
  });

  const { data: won, mutate: beatGame } = api.game.beatEncounter.useMutation(
    {},
  );

  useEffect(() => {
    mapFile.chapters.map((val, index) => {
      if (nameToFileName(val.name) == reg) {
        mapFile.chapters[index]?.nodes.map((value) => {
          if (nameToFileName(value.name) == enc) {
            setEncounterLabel(value.name);
            return;
          }
        });
        return;
      }
    });

    if (data?.enemies) {
      const convertedEnemies = (data.enemies as Enemy[]).map((encounter) => ({
        image: encounter.image,
        name: encounter.name,
        health: Math.floor(encounter.health * (1 + 0.1 * getLevel(user))),
        maxHealth: Math.floor(encounter.health * (1 + 0.1 * getLevel(user))),
        critChance: encounter.critChance,
        strength: encounter.strength,
        armor: encounter.armor,
        magic: encounter.magic,
        resist: encounter.resist,
        dead: false,
        critHit: false,
      }));

      setEnemies(convertedEnemies);
      setOriginalEnemies(convertedEnemies);
    }
  }, [data, user]);

  useEffect(() => {
    const convertedPlayer = {
      image: "/player.png",
      name: name,
      health: userStats.health,
      maxHealth: userStats.health,
      critChance: userStats.critChance,
      strength: userStats.strength,
      armor: userStats.armor,
      magic: userStats.magic,
      resist: userStats.resist,
      dead: false,
      critHit: false,
    };

    setPlayer(convertedPlayer);
    setOriginalPlayer(convertedPlayer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const intervalRef = useRef<number | null>(null);

  function gameLoop() {
    if (enemies && !loopRunning) {
      let currentEnemyIndex = 0;
      setLoopRunning(true);
      intervalRef.current = setInterval(() => {
        // Update Enemy health for each player attack
        setEnemies((prevEnemies) => {
          if (prevEnemies) {
            const updatedEnemies = [...prevEnemies];
            const currentEnemy = updatedEnemies[currentEnemyIndex];

            // Enemy incoming damage updates
            if (currentEnemy) {
              let damage =
                Math.max(0, userStats.strength - currentEnemy.armor) +
                Math.max(0, userStats.magic - currentEnemy.resist);

              if (Math.random() * 100 <= userStats.critChance) {
                damage *= 3;
                if (damage > 0) {
                  currentEnemy.critHit = true;
                }
              } else {
                currentEnemy.critHit = false;
              }

              const newHealth = currentEnemy.health - damage;
              const health = newHealth < 0 ? 0 : newHealth;

              if (health <= 0) {
                currentEnemy.dead = true;
              }

              updatedEnemies[currentEnemyIndex] = {
                ...currentEnemy,
                health,
              };
            }

            if (currentEnemy && currentEnemy.health <= 0) {
              currentEnemyIndex++;
              if (currentEnemyIndex >= updatedEnemies.length) {
                clearInterval(intervalRef.current!);
              }
            }

            // Check if all enemies are dead
            const allEnemiesDead = updatedEnemies.every((enemy) => enemy.dead);
            if (allEnemiesDead) {
              clearInterval(intervalRef.current ?? 0);
              setLoopRunning(false);

              // Handle win
              beatGame({ encounterid: enc });

              // Dialog to show loot
              setDialogOpen(true);
            }

            return updatedEnemies;
          }

          return prevEnemies;
        });

        // Update Player health for each enemy attack that is still alive
        setPlayer((prevPlayer) => {
          if (prevPlayer) {
            const updatedPlayer = { ...prevPlayer };
            updatedPlayer.critHit = false;

            let totaldmg = 0;
            for (let i = 0; i < enemies.length; i++) {
              const currentEnemy = enemies[i];
              if (currentEnemy) {
                let damage =
                  Math.max(0, currentEnemy.strength - userStats.armor) +
                  Math.max(0, currentEnemy.magic - userStats.resist);

                if (Math.random() * 100 <= currentEnemy.critChance) {
                  damage *= 3;
                  if (damage > 0) {
                    updatedPlayer.critHit = true;
                  }
                }

                totaldmg += damage;
              }
            }

            const newHealth = updatedPlayer.health - totaldmg;
            const health = newHealth < 0 ? 0 : newHealth;

            if (health <= 0) {
              updatedPlayer.dead = true;
            }

            // Check if player is dead
            if (updatedPlayer.health <= 0) {
              clearInterval(intervalRef.current ?? 0);
              setLoopRunning(false);
              console.log("You lose!");
            }

            return {
              ...updatedPlayer,
              health,
            };
          }

          return prevPlayer;
        });
      }, 100) as unknown as number;
    }
  }

  function reset() {
    clearInterval(intervalRef.current ?? 0);
    setPlayer(originalPlayer);
    setEnemies(originalEnemies);
    // Remove the critHit condition
    setPlayer((prevPlayer) => {
      if (prevPlayer) {
        return {
          ...prevPlayer,
          critHit: false,
        };
      }
      return prevPlayer;
    });

    // Remove the critHit condition
    setEnemies((prevEnemies) => {
      if (prevEnemies) {
        return prevEnemies.map((enemy) => ({
          ...enemy,
          critHit: false,
        }));
      }
      return prevEnemies;
    });

    setLoopRunning(false);
  }

  return (
    <TooltipProvider>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-800 sm:max-w-[425px]">
          <ReactMarkdown className="prose p-4 text-white prose-headings:text-purple-500 prose-em:text-yellow-200">
            {data?.loot}
          </ReactMarkdown>
        </DialogContent>
      </Dialog>
      <div className="h-[92.5vh] bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex justify-center space-x-4 pt-2">
          <div className="flex size-full flex-col items-center justify-center">
            <div className="flex grid w-[80vw] grid-cols-3 items-center justify-between rounded-xl bg-[#15162c] p-4 px-8 text-end text-5xl font-bold">
              {!data ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-200" />
                </div>
              ) : (
                <div className="flex text-center text-5xl font-bold">
                  {encounterLabel}
                </div>
              )}

              <div className="grid grid-cols-3 items-center justify-between gap-8">
                <div>
                  <Link href={`/map/${reg}`}>
                    <div
                      onClick={reset}
                      className="m-2 cursor-pointer rounded-lg bg-purple-700 p-1 text-center text-base font-bold duration-150 hover:bg-[#15162c]"
                    >
                      Back
                    </div>
                  </Link>
                </div>
                <div>
                  <div
                    onClick={gameLoop}
                    className="m-2 cursor-pointer rounded-lg bg-purple-700 p-1 text-center text-base font-bold duration-150 hover:bg-[#15162c]"
                  >
                    Start
                  </div>
                </div>
                <div>
                  <div
                    onClick={reset}
                    className="m-2 cursor-pointer rounded-lg bg-purple-700 p-1 text-center text-base font-bold duration-150 hover:bg-[#15162c]"
                  >
                    Reset
                  </div>
                </div>
              </div>
              {"Level " + getLevel(user)}
            </div>

            {!data ? (
              <div className="m-4 flex h-[75vh] w-[80vw] items-center justify-center rounded-xl border-4 border-[#15162c] bg-indigo-950">
                <Loader2 className="h-32 w-32 animate-spin text-yellow-200" />
              </div>
            ) : (
              <div className="m-4 grid h-[75vh] w-[80vw] grid-cols-3 rounded-xl border-4 border-[#15162c] bg-indigo-950">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-start space-y-12">
                    <Tooltip>
                      <TooltipTrigger>
                        <Card
                          className={`${
                            player?.dead || !loopRunning
                              ? ""
                              : player?.critHit
                                ? "animate-wiggle-more animate-infinite"
                                : "animate-wiggle animate-infinite"
                          } w-[250px] bg-[#15162c] p-4 text-2xl  text-white`}
                        >
                          <div
                            style={{
                              color: player?.dead
                                ? "black"
                                : player?.critHit
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            <div className="grid grid-cols-2 justify-between p-2">
                              <div className="flex flex-row items-center justify-center p-2 font-bold">
                                {player?.name}
                              </div>
                              <div className="flex flex-row items-center justify-center p-2">
                                <HeartIcon></HeartIcon>
                                {player?.health}
                              </div>
                            </div>
                            <Progress
                              value={
                                ((player?.health ?? 0) /
                                  (player?.maxHealth ?? 1)) *
                                100
                              }
                            ></Progress>
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent className="animate-jump-in bg-[#282A36] text-white">
                        <div className="flex flex-col justify-center">
                          <div className="grid grid-cols-3 grid-rows-2">
                            <div className="flex flex-col items-center justify-center p-2">
                              <HeartIcon></HeartIcon>
                              {player?.maxHealth}
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                              <SwordIcon></SwordIcon>
                              {player?.strength}
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                              <ShieldIcon></ShieldIcon>
                              {player?.armor}
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                              <CloverIcon></CloverIcon>
                              {player?.critChance}
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                              <Wand2></Wand2>
                              {player?.magic}
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                              <SparkleIcon></SparkleIcon>
                              {player?.resist}
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col items-center justify-center p-16">
                  <div className="flex grid grid-cols-3 items-center gap-12">
                    {enemies?.map((enemy, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger>
                          <Card
                            className={`${
                              enemy.dead || !loopRunning
                                ? ""
                                : enemy.critHit
                                  ? "animate-wiggle-more animate-infinite"
                                  : "animate-wiggle animate-infinite"
                            } w-[250px] bg-purple-950 p-4 text-white`}
                          >
                            <div
                              style={{
                                color: enemy.dead
                                  ? "black"
                                  : enemy.critHit
                                    ? "red"
                                    : "inherit",
                              }}
                            >
                              <div className="grid grid-cols-2 p-2">
                                <div>{enemy.name}</div>
                                <div>{enemy.health}</div>
                              </div>
                              <Progress
                                value={(enemy.health / enemy.maxHealth) * 100}
                              ></Progress>
                            </div>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent className="animate-jump-in bg-[#282A36] text-white">
                          <div className="flex flex-col ">
                            <div className="grid grid-cols-3 grid-rows-2">
                              <div className="flex flex-col items-center justify-center p-2">
                                <HeartIcon></HeartIcon>
                                {enemy.maxHealth}
                              </div>
                              <div className="flex flex-col items-center justify-center p-2">
                                <SwordIcon></SwordIcon>
                                {enemy.strength}
                              </div>
                              <div className="flex flex-col items-center justify-center p-2">
                                <ShieldIcon></ShieldIcon>
                                {enemy.armor}
                              </div>
                              <div className="flex flex-col items-center justify-center p-2">
                                <CloverIcon></CloverIcon>
                                {enemy.critChance}
                              </div>
                              <div className="flex flex-col items-center justify-center p-2">
                                <Wand2></Wand2>
                                {enemy.magic}
                              </div>
                              <div className="flex flex-col items-center justify-center p-2">
                                <SparkleIcon></SparkleIcon>
                                {enemy.resist}
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
