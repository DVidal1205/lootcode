interface Node {
  pos: number[];
  name: string;
  next: string[];
}

interface Graph {
  nodes: Node[] | undefined;
  nodeRadius: number;
  getNode: number;
  setNode: any;
}

const nodeRad = 25;
const mapRes = [1280, 720];

export default function NodeGraph({
  nodes,
  nodeRadius,
  getNode,
  setNode,
}: Graph) {
  if (nodes == undefined)
    return (
      <div className="mx-2 rounded-xl border-2 border-yellow-200 p-4 shadow-xl">
        Error in finding node list
      </div>
    );

  return (
    <svg
      viewBox={"0 0 " + mapRes[0] + " " + mapRes[1]}
      className="mx-2 rounded-xl border-2 border-yellow-200 p-4 shadow-xl"
    >
      {nodes.map((node: Node, index) => (
        <g key={index} id={"node-" + node.name}>
          {node.next.map((depend, index) => (
            <line
              key={index}
              x1={getNodeX(node.pos[0] ?? 0)}
              y1={getNodeY(node.pos[1] ?? 0)}
              x2={getNodeX(findNodePos(nodes, depend)?.[0] ?? 0)}
              y2={getNodeY(findNodePos(nodes, depend)?.[1] ?? 0)}
              stroke="white"
            ></line>
          ))}
          <circle
            onClick={() => {
              getNode != index ? setNode(index) : setNode(-1);
              console.log(getNode);
            }}
            r={"" + nodeRadius}
            cx={"" + getNodeX(node.pos[0] ?? 0)}
            cy={"" + getNodeY(node.pos[1] ?? 0)}
            stroke={getNode == index ? "orange" : "black"}
            strokeWidth={getNode == index ? "4" : "1"}
            className="fill-yellow-200 hover:fill-yellow-400"
          ></circle>
          <text
            id={"nodeText" + index}
            x={"" + (getNodeX(node.pos[0] ?? 0) - node.name.length * 5)}
            y={"" + (getNodeY(node.pos[1] ?? 0) + nodeRadius * 2)}
            className="border fill-white stroke-black stroke-1 text-xl font-bold"
          >
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function getNodeX(x: number): number {
  return (mapRes[0] ?? 0) * (x / 100);
}

function getNodeY(y: number): number {
  return (mapRes[1] ?? 0) * (y / 100);
}

//Finds a node's position by its name
function findNodePos(list: Node[], name: string): number[] | undefined {
  let pos: number[];
  pos = [-1, -1]; // Default value for typescript
  list.map((node: Node) => {
    if (node.name === name) {
      // console.log("inside: " + node.pos);
      pos = node.pos;
      return;
    }
  });

  return pos;
}

function getNode(list: Node[], i: number): Node | undefined {
  return list[i];
}