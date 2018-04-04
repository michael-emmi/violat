import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('spec');

export type Type = string | any[];

export type Value = number | any;

export interface Parameter {
  type: Type;
}

export interface Method {
  name: string;
  parameters: Parameter[];
  void: boolean;
  readonly: boolean;
  trusted: boolean;
  visibility: string;
 }

export interface Spec {
  class: string;
  parameters: Parameter[];
  default_parameters: Value[];
  methods: Method[];
}
