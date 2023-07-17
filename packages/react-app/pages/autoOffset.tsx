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
      <button onClick={() => offset?.()}>offset</button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
    </div>
  );
}
