"use client";

import {
  GUser,
  Stats,
  fakeEquip,
  getItemName,
  getUserStats,
  isEquipped,
} from "~/app/game/utility";
import itemList from "~/gameinfo/items.json";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  BrainIcon,
  CoinsIcon,
  FlaskRound,
  LoaderIcon,
  PlusIcon,
  ShieldIcon,
  SparkleIcon,
  SwordIcon,
  Wand2,
} from "lucide-react";
import ItemDisplay from "./itemdisplay";
import StatDisplay from "./statdisplay";

interface IParams {
  name: string;
  user: GUser;
}

export default function Inventory({ name, user }: IParams) {
  const [getUser, setUser] = useState<GUser>(user);
  const [fetching, setFetching] = useState(false);
  const [selItem, setSelItem] = useState(-1);

  const { data: newUser, refetch: equipCallback } =
    api.game.equipItemID.useQuery(
      {
        item: selItem,
      },
      { enabled: false, retry: false },
    );

  useEffect(() => {
    if (selItem != -1) {
      setFetching(true);
      void equipCallback().then((response) => {
        if (response != undefined) {
          setUser(response.data ?? getUser);
          setSelItem(-1);
          setFetching(false);
        }
      });
    }
  }, [equipCallback, getUser, selItem]);

  return (
    <div className="flex flex-row">
      <StatDisplay name={name} user={getUser} />
      <div className="m-4 h-[80vh] w-[70vw] rounded-xl bg-[#15162c] p-2 text-center font-bold text-white">
        <div className="m-2 text-left text-3xl">
          <div className="flex items-center gap-2">
            Items
            {fetching ? <LoaderIcon /> : <div />}
          </div>
          <div className="my-4 grid auto-cols-max grid-flow-col gap-4">
            {itemList.items.map((value, index) =>
              getUser.items[index] == "1" ? (
                isEquipped(getUser, index) ? (
                  <div
                    className="cursor-pointer rounded border border-purple-700 bg-purple-950 p-4 duration-150 hover:bg-[#15162c]"
                    onClick={() => setSelItem(index)}
                    key={index}
                  >
                    <ItemDisplay id={index} />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer rounded border-purple-700 bg-purple-700 p-4 duration-150 hover:bg-[#15162c]"
                    onClick={() => setSelItem(index)}
                    key={index}
                  >
                    <ItemDisplay id={index} />
                  </div>
                )
              ) : (
                <div key={index} />
              ),
            )}
          </div>
        </div>
        <div className="m-2 text-left text-3xl">
          Collectibles
          <div className="my-4 grid auto-cols-max grid-flow-col gap-4">
            {itemList.items.map((value, index) =>
              getUser.items[index] == "1" ? (
                <div
                  className="cursor-pointer rounded bg-purple-700 p-4 duration-150 hover:bg-[#15162c]"
                  key={index}
                >
                  Collectible
                </div>
              ) : (
                <div key={index} />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}