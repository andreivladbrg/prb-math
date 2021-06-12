import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import {
  E,
  HALF_SCALE,
  MAX_SD59x18,
  MAX_UD60x18,
  MAX_WHOLE_SD59x18,
  MIN_SD59x18,
  MIN_WHOLE_SD59x18,
  PI,
  SQRT_MAX_SD59x18,
} from "../../../helpers/constants";
import { mul } from "../../../helpers/ethers.math";
import { bn } from "../../../helpers/numbers";

export default function shouldBehaveLikeMul(): void {
  context("when one of the operands is zero", function () {
    const testSets = [
      [fp(MIN_SD59x18).add(1), bn("0")],
      [fp("0.5"), bn("0")],
      [bn("0"), fp("0.5")],
    ].concat([
      [bn("0"), fp("0.5")],
      [fp("0.5"), bn("0")],
      [fp(MAX_SD59x18), bn("0")],
    ]);

    forEach(testSets).it("takes %e and %e and returns 0", async function (x: BigNumber, y: BigNumber) {
      const expected: BigNumber = bn("0");
      expect(expected).to.equal(await this.contracts.prbMathSd59x18.doMul(x, y));
      expect(expected).to.equal(await this.contracts.prbMathSd59x18Typed.doMul(x, y));
    });
  });

  context("when neither of the operands is zero", function () {
    context("when one of the operands is min sd59x18", function () {
      const testSets = [
        [fp(MIN_SD59x18), fp("1e-18")],
        [fp("1e-18"), fp(MIN_SD59x18)],
      ];

      forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
        await expect(this.contracts.prbMathSd59x18.doMul(x, y)).to.be.reverted;
        await expect(this.contracts.prbMathSd59x18Typed.doMul(x, y)).to.be.reverted;
      });
    });

    context("when both operands are not min sd59x18", function () {
      context("when the result overflows", function () {
        const testSets = [
          [fp(MIN_SD59x18).add(1), fp(MIN_SD59x18).add(1)],
          [fp(MIN_SD59x18).add(1), fp("2")],
          [fp(MIN_WHOLE_SD59x18), fp(MIN_WHOLE_SD59x18)],
          [fp(SQRT_MAX_SD59x18).mul(-1), fp(SQRT_MAX_SD59x18).mul(-1).sub(1)],
        ].concat([
          [fp("2"), fp(MAX_UD60x18)],
          [fp(SQRT_MAX_SD59x18), fp(SQRT_MAX_SD59x18).add(1)],
          [fp(MAX_WHOLE_SD59x18), fp(MAX_WHOLE_SD59x18)],
          [fp(MAX_SD59x18), fp(MAX_SD59x18)],
        ]);

        forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
          await expect(this.contracts.prbMathSd59x18.doMul(x, y)).to.be.reverted;
          await expect(this.contracts.prbMathSd59x18Typed.doMul(x, y)).to.be.reverted;
        });
      });

      context("when the result does not overflow", function () {
        context("when the operands have the same sign", function () {
          const testSets = [
            [fp(MIN_SD59x18).add(fp(HALF_SCALE)).add(1), fp("-1e-18")],
            [fp(MIN_WHOLE_SD59x18).add(fp(HALF_SCALE)), fp("-1e-18")],
            [fp("-1e18"), fp("-1e6")],
            [fp("-12983.989"), fp("-782.99")],
            [fp("-9817"), fp("-2348")],
            [fp("-314.271"), fp("-188.19")],
            [fp("-18.3"), fp("-12.04")],
            [fp(PI).mul(-1), fp(E).mul(-1)],
            [fp("-2.098"), fp("-1.119")],
            [fp("-1"), fp("-1")],
            [fp("-0.01"), fp("-0.05")],
            [fp("-0.001"), fp("-0.01")],
            [fp("-1e-5"), fp("-1e-5")],
            [fp("-6e-18"), fp("-0.1")],
            [fp("-1e-18"), fp("-1e-18")],
          ].concat([
            [fp("1e-18"), fp("1e-18")],
            [fp("6e-18"), fp("0.1")],
            [fp("1e-9"), fp("1e-9")],
            [fp("1e-5"), fp("1e-5")],
            [fp("0.001"), fp("0.01")],
            [fp("0.01"), fp("0.05")],
            [fp("1"), fp("1")],
            [fp("2.098"), fp("1.119")],
            [fp(PI), fp(E)],
            [fp("18.3"), fp("12.04")],
            [fp("314.271"), fp("188.19")],
            [fp("9817"), fp("2348")],
            [fp("12983.989"), fp("782.99")],
            [fp("1e18"), fp("1e6")],
            [fp(MAX_WHOLE_SD59x18).sub(fp(HALF_SCALE)), fp("1e-18")],
            [fp(MAX_SD59x18).sub(fp(HALF_SCALE)), fp("1e-18")],
          ]);

          forEach(testSets).it(
            "takes %e and %e and returns the correct value",
            async function (x: BigNumber, y: BigNumber) {
              const expected: BigNumber = mul(x, y);
              expect(expected).to.equal(await this.contracts.prbMathSd59x18.doMul(x, y));
              expect(expected).to.equal(await this.contracts.prbMathSd59x18Typed.doMul(x, y));
            },
          );
        });

        context("when the operands do not have the same sign", function () {
          const testSets = [
            [fp(MIN_SD59x18).add(fp(HALF_SCALE)).add(1), fp("1e-18")],
            [fp(MIN_WHOLE_SD59x18).add(fp(HALF_SCALE)), fp("1e-18")],
            [fp("-1e18"), fp("1e6")],
            [fp("-12983.989"), fp("782.99")],
            [fp("-9817"), fp("2348")],
            [fp("-314.271"), fp("188.19")],
            [fp("-18.3"), fp("12.04")],
            [fp(PI).mul(-1), fp(E)],
            [fp("-2.098"), fp("1.119")],
            [fp("-1"), fp("1")],
            [fp("-0.01"), fp("0.05")],
            [fp("-0.001"), fp("0.01")],
            [fp("-1e-5"), fp("1e-5")],
            [fp("-6e-18"), fp("0.1")],
            [fp("-1e-18"), fp("1e-18")],
          ].concat([
            [fp("1e-18"), fp("-1e-18")],
            [fp("6e-18"), fp("-0.1")],
            [fp("1e-9"), fp("-0.000000001")],
            [fp("1e-5"), fp("-1e-5")],
            [fp("0.001"), fp("-0.01")],
            [fp("0.01"), fp("-0.05")],
            [fp("1"), fp("-1")],
            [fp("2.098"), fp("-1.119")],
            [fp(PI), fp(E).mul(-1)],
            [fp("18.3"), fp("-12.04")],
            [fp("314.271"), fp("-188.19")],
            [fp("9817"), fp("-2348")],
            [fp("12983.989"), fp("-782.99")],
            [fp("1e18"), fp("-1e6")],
            [fp(MAX_WHOLE_SD59x18).sub(fp(HALF_SCALE)), fp("-1e-18")],
            [fp(MAX_SD59x18).sub(fp(HALF_SCALE)), fp("-1e-18")],
          ]);

          forEach(testSets).it(
            "takes %e and %e and returns the correct value",
            async function (x: BigNumber, y: BigNumber) {
              const expected: BigNumber = mul(x, y);
              expect(expected).to.equal(await this.contracts.prbMathSd59x18.doMul(x, y));
              expect(expected).to.equal(await this.contracts.prbMathSd59x18Typed.doMul(x, y));
            },
          );
        });
      });
    });
  });
}