import { usePrepareContractWrite, useContractWrite, useChainId } from "wagmi";
import ToucanClient from "toucan-sdk";
import { useProvider, useSigner } from "wagmi";

import { parseEther } from "ethers/lib/utils";

export default function AutoOffsetPoolToken() {
  const poolAddress = "0x02De4766C272abc10Bc88c220D214A26960a7e92";
  const offsetHelperAddress = "0xAB62E8a5A43453339f745EaFcbEE0302A31c3d5E";
  const amount = parseEther("1");
  const provider = useProvider();
  const { data: signer, isError } = useSigner();

  const toucan = new ToucanClient("celo", provider);
  signer && toucan.setSigner(signer);
  const poolToken = toucan.getPoolContract("NCT");

  const approve = async () => {
    return await poolToken.approve(offsetHelperAddress, amount);
  };

  const { config } = usePrepareContractWrite({
    address: offsetHelperAddress,
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_poolToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_amountToOffset",
            type: "uint256",
          },
        ],
        name: "autoOffsetPoolToken",
        outputs: [
          {
            internalType: "address[]",
            name: "tco2s",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "autoOffsetPoolToken",
    args: [
      poolAddress,
      amount,
      {
        gasLimit: 2500000,
      },
    ],
  });

  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  const offset = async () => {
    const tx = await approve();
    await tx.wait();

    write && write();
  };

  return (
    <div>
      <button
        className="inline-flex w-full justify-center rounded-full border px-5 my-5 py-2 text-md font-medium border-wood bg-prosperity text-black hover:bg-snow"
        onClick={() => offset?.()}
      >
        offset
      </button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && (
        <div>
          <a
            href={`https://celoscan.io/${JSON.stringify(data.hash)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            Transaction: {JSON.stringify(data.hash)}
          </a>{" "}
        </div>
      )}{" "}
    </div>
  );
}
