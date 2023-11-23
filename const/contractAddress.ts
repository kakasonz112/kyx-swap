import { ethers } from "ethers";


export const swapContract = "0xf5479bb1ecb96a55acba5069f47389121b57ff82";

export const prepareData = (contract: string, types: string[], args: any[]): string => {
    const params = prepareParams(types, args);
    return `${contract}${params.slice(2)}`;
};

export const prepareParams = (types: string[], args: any[]): string => {
    const abiCoder = ethers.utils.defaultAbiCoder;
    for (let i = 0; i < args.length; i++) {
        if (types[i] === "bytes32") {
            args[i] = ethers.utils.hexlify(ethers.utils.zeroPad(args[i], 32));
        }
    }
    // @ts-ignore
    return abiCoder.encode(types, args);
};