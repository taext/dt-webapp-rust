/* tslint:disable */
/* eslint-disable */
export function init_panic_hook(): void;
export function get_unit_name(decimal_places: number): string;
export function start(): void;
export class DecimalTimeJS {
  free(): void;
  constructor(year: number, day_of_year: number, decimal_day: number);
  static now(): DecimalTimeJS;
  get_year(): number;
  get_day_of_year(): number;
  get_decimal_day(): number;
  format_decimal(decimal_places: number): string;
  format_full(include_year: boolean, include_day: boolean, decimal_places: number): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_decimaltimejs_free: (a: number, b: number) => void;
  readonly decimaltimejs_new: (a: number, b: number, c: number) => [number, number, number];
  readonly decimaltimejs_now: () => number;
  readonly decimaltimejs_get_year: (a: number) => number;
  readonly decimaltimejs_get_day_of_year: (a: number) => number;
  readonly decimaltimejs_get_decimal_day: (a: number) => number;
  readonly decimaltimejs_format_decimal: (a: number, b: number) => [number, number];
  readonly decimaltimejs_format_full: (a: number, b: number, c: number, d: number) => [number, number];
  readonly get_unit_name: (a: number) => [number, number];
  readonly init_panic_hook: () => void;
  readonly start: () => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
