import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export type HASHAlgorithm = "bcrypt";
export default class Hash {
  static BCRYPT: HASHAlgorithm = "bcrypt";
  static makeHash(text: string, algo: HASHAlgorithm = Hash.BCRYPT) {
    switch (algo) {
      default: {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(text, salt);
        return hash;
      }
    }
  }

  static checkHash(
    text?: string | null,
    hash?: string | null,
    algo: HASHAlgorithm = Hash.BCRYPT,
  ): boolean {
    switch (algo) {
      default: {
        return bcrypt.compareSync(text || "", hash || "");
      }
    }
  }
}
