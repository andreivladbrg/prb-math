import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

import {
  E,
  HALF_SCALE,
  MAX_SD59x18,
  MAX_WHOLE_SD59x18,
  MIN_SD59x18,
  MIN_WHOLE_SD59x18,
  PI,
  SQRT_MAX_SD59x18,
  SQRT_MAX_UD60x18,
} from "../../../helpers/constants";
import { PRBMathErrors, PRBMathSD59x18Errors } from "../../shared/errors";
import { mul } from "../../shared/mirrors";

export default function shouldBehaveLikeMul(): void {
  context("when one of the operands is zero", function () {
    const testSets = [
      [toBn(MIN_SD59x18).add(1), Zero],
      [toBn("0.5"), Zero],
    ].concat([
      [Zero, toBn("0.5")],
      [toBn(MAX_SD59x18), Zero],
    ]);

    forEach(testSets).it("takes %e and %e and returns 0", async function (x: BigNumber, y: BigNumber) {
      const expected: BigNumber = Zero;
      expect(expected).to.equal(await this.contracts.prbMathSd59x18.doMul(x, y));
      expect(expected).to.equal(await this.contracts.prbMathSd59x18Typed.doMul(x, y));
    });
  });

  context("when neither of the operands is zero", function () {
    context("when one of the operands is min sd59x18", function () {
      const testSets = [
        [toBn(MIN_SD59x18), toBn("1e-18")],
        [toBn("1e-18"), toBn(MIN_SD59x18)],
      ];

      forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
        await expect(this.contracts.prbMathSd59x18.doMul(x, y)).to.be.revertedWith(
          PRBMathSD59x18Errors.MulInputTooSmall,
        );
        await expect(this.contracts.prbMathSd59x18Typed.doMul(x, y)).to.be.revertedWith(
          PRBMathSD59x18Errors.MulInputTooSmall,
        );
      });
    });

    context("when neither operand is min sd59x18", function () {
      context("when the result overflows sd59x18", function () {
        const testSets = [
          [toBn(MIN_SD59x18).add(1), toBn("2")],
          [toBn(SQRT_MAX_SD59x18).mul(-1), toBn(SQRT_MAX_SD59x18).mul(-1).sub(1)],
        ].concat([
          [toBn("2"), toBn(MAX_SD59x18)],
          [toBn(SQRT_MAX_SD59x18), toBn(SQRT_MAX_SD59x18).add(1)],
        ]);

        forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
          await expect(this.contracts.prbMathSd59x18.doMul(x, y)).to.be.revertedWith(PRBMathSD59x18Errors.MulOverflow);
          await expect(this.contracts.prbMathSd59x18Typed.doMul(x, y)).to.be.revertedWith(
            PRBMathSD59x18Errors.MulOverflow,
          );
        });
      });

      context("when the result does not overflow sd59x18", function () {
        context("when the result overflows", function () {
          const testSets = [
            [toBn(MIN_SD59x18).add(1), toBn(MIN_SD59x18).add(1)],
            [toBn(MIN_WHOLE_SD59x18), toBn(MIN_WHOLE_SD59x18)],
            [toBn(SQRT_MAX_UD60x18).add(1).mul(-1), toBn(SQRT_MAX_UD60x18).add(1).mul(-1)],
          ].concat([
            [toBn(SQRT_MAX_UD60x18).add(1), toBn(SQRT_MAX_UD60x18).add(1)],
            [toBn(MAX_WHOLE_SD59x18), toBn(MAX_WHOLE_SD59x18)],
            [toBn(MAX_SD59x18), toBn(MAX_SD59x18)],
          ]);

          forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
            await expect(this.contracts.prbMathSd59x18.doMul(x, y)).to.be.revertedWith(
              PRBMathErrors.MulDivFixedPointOverflow,
            );
            await expect(this.contracts.prbMathSd59x18Typed.doMul(x, y)).to.be.revertedWith(
              PRBMathErrors.MulDivFixedPointOverflow,
            );
          });
        });

        context("when the result does not overflow", function () {
          context("when the operands have the same sign", function () {
            const testSets = [
              [toBn(MIN_SD59x18).add(toBn(HALF_SCALE)).add(1), toBn("-1e-18")],
              [toBn(MIN_WHOLE_SD59x18).add(toBn(HALF_SCALE)), toBn("-1e-18")],
              [toBn("-1e18"), toBn("-1e6")],
              [toBn("-12983.989"), toBn("-782.99")],
              [toBn("-9817"), toBn("-2348")],
              [toBn("-314.271"), toBn("-188.19")],
              [toBn("-18.3"), toBn("-12.04")],
              [toBn(PI).mul(-1), toBn(E).mul(-1)],
              [toBn("-2.098"), toBn("-1.119")],
              [toBn("-1"), toBn("-1")],
              [toBn("-0.01"), toBn("-0.05")],
              [toBn("-0.001"), toBn("-0.01")],
              [toBn("-1e-5"), toBn("-1e-5")],
              [toBn("-6e-18"), toBn("-0.1")],
              [toBn("-1e-18"), toBn("-1e-18")],
            ].concat([
              [toBn("1e-18"), toBn("1e-18")],
              [toBn("6e-18"), toBn("0.1")],
              [toBn("1e-9"), toBn("1e-9")],
              [toBn("1e-5"), toBn("1e-5")],
              [toBn("0.001"), toBn("0.01")],
              [toBn("0.01"), toBn("0.05")],
              [toBn("1"), toBn("1")],
              [toBn("2.098"), toBn("1.119")],
              [toBn(PI), toBn(E)],
              [toBn("18.3"), toBn("12.04")],
              [toBn("314.271"), toBn("188.19")],
              [toBn("9817"), toBn("2348")],
              [toBn("12983.989"), toBn("782.99")],
              [toBn("1e18"), toBn("1e6")],
              [toBn(MAX_WHOLE_SD59x18).sub(toBn(HALF_SCALE)), toBn("1e-18")],
              [toBn(MAX_SD59x18).sub(toBn(HALF_SCALE)), toBn("1e-18")],
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
              [toBn(MIN_SD59x18).add(toBn(HALF_SCALE)).add(1), toBn("1e-18")],
              [toBn(MIN_WHOLE_SD59x18).add(toBn(HALF_SCALE)), toBn("1e-18")],
              [toBn("-1e18"), toBn("1e6")],
              [toBn("-12983.989"), toBn("782.99")],
              [toBn("-9817"), toBn("2348")],
              [toBn("-314.271"), toBn("188.19")],
              [toBn("-18.3"), toBn("12.04")],
              [toBn(PI).mul(-1), toBn(E)],
              [toBn("-2.098"), toBn("1.119")],
              [toBn("-1"), toBn("1")],
              [toBn("-0.01"), toBn("0.05")],
              [toBn("-0.001"), toBn("0.01")],
              [toBn("-1e-5"), toBn("1e-5")],
              [toBn("-6e-18"), toBn("0.1")],
              [toBn("-1e-18"), toBn("1e-18")],
            ].concat([
              [toBn("1e-18"), toBn("-1e-18")],
              [toBn("6e-18"), toBn("-0.1")],
              [toBn("1e-9"), toBn("-0.000000001")],
              [toBn("1e-5"), toBn("-1e-5")],
              [toBn("0.001"), toBn("-0.01")],
              [toBn("0.01"), toBn("-0.05")],
              [toBn("1"), toBn("-1")],
              [toBn("2.098"), toBn("-1.119")],
              [toBn(PI), toBn(E).mul(-1)],
              [toBn("18.3"), toBn("-12.04")],
              [toBn("314.271"), toBn("-188.19")],
              [toBn("9817"), toBn("-2348")],
              [toBn("12983.989"), toBn("-782.99")],
              [toBn("1e18"), toBn("-1e6")],
              [toBn(MAX_WHOLE_SD59x18).sub(toBn(HALF_SCALE)), toBn("-1e-18")],
              [toBn(MAX_SD59x18).sub(toBn(HALF_SCALE)), toBn("-1e-18")],
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
  });
}