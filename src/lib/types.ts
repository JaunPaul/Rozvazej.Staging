export type CustomErrors = Record<
  string,
  | undefined
  | null
  | string
  | string[]
  | Record<string, any>
  | Array<string | Record<string, any>>
>;

export type Company =
  | "Wolt"
  | "Foodora"
  | "Bolt"
  | "Development"
  | "Staging"
  | "";
export type FormStates = "submitting" | "success" | "fail" | "neutral";

export type Bucket = "nationalId" | "euPassport" | "nonEu" | "driversLicense";
