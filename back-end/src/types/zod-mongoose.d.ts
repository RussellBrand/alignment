/**
 * Type declarations to enhance @zodyac/zod-mongoose
 */
import { z, ZodTypeDef } from "zod";

declare module "zod" {
  interface ZodType<
    Output = unknown,
    Def extends ZodTypeDef = ZodTypeDef,
    Input = Output
  > {
    // This enhances the ZodType interface from @zodyac/zod-mongoose to use unknown instead of any
    _def: Def & {
      typeName: string;
      shape?: () => Record<string, z.ZodTypeAny>;
      values?: Array<string | number>;
    };
  }
}
