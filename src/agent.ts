import { ethers } from "ethers";
import {
  Finding,
  FindingSeverity,
  FindingType,
  getJsonRpcUrl,
} from "forta-agent";
import {
  GOVERNANCEV2_HELPER_ABI,
  AAVE_GOVERNANCEV2_ABI,
  GOVERNANCEV2_HELPER_ADDRESS,
  AAVE_GOVERNANCEV2_ADDRESS,
} from "./constants";
import { Proposal } from "./models/proposal.model";

const provideHandleBlock = () => {
  let previousProposals: Proposal[] = [];

  const provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

  const aaveGovernance = new ethers.Contract(
    AAVE_GOVERNANCEV2_ADDRESS,
    AAVE_GOVERNANCEV2_ABI,
    provider
  );

  const governanceHelper = new ethers.Contract(
    GOVERNANCEV2_HELPER_ADDRESS,
    GOVERNANCEV2_HELPER_ABI,
    provider
  );

  return async () => {
    const findings: Finding[] = [];

    const proposalsCount: number = await aaveGovernance.getProposalsCount();

    const currentProposals: Proposal[] = (
      await governanceHelper.getProposals(
        0,
        proposalsCount,
        AAVE_GOVERNANCEV2_ADDRESS
      )
    ).map((p: any) => new Proposal(p));

    const newExecutedProposals = currentProposals.filter((cp) =>
      previousProposals.some(
        (pp) => pp.id === cp.id && cp.executed === true && pp.executed === false
      )
    );

    if (newExecutedProposals.length) {
      const description = `These governance proposals are EXECUTED: ${newExecutedProposals
        .map(
          (p) => `Id: ${p.id}, Executor: ${p.executor}, Creator: ${p.creator}`
        )
        .join(" | ")}`;

      findings.push(
        Finding.fromObject({
          name: "Governance proposals are EXECUTED",
          description,
          alertId: "AAVE_PROPOSALS_EXECUTED",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
        })
      );
    }

    previousProposals = currentProposals;

    return findings;
  };
};

export default {
  handleBlock: provideHandleBlock(),
};
