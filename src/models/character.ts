import { v4 } from "uuid";

export interface CharacterProps {
  uid: string;
  name: string;
  sex: string;
  age?: number;
  height?: number;
  weight?: number;
  bodyDesc?: string;
  job?: string;
  personality?: string;
  otherDesc?: string;
  experience?: string;
  currentStatusDesc?: string;
  currentScene?: string;
}

export class Character implements CharacterProps {
  uid: string;
  name: string;
  sex: string;
  age?: number;
  height?: number;
  weight?: number;
  bodyDesc?: string;
  job?: string;
  personality?: string;
  otherDesc?: string;
  experience?: string;
  currentStatusDesc?: string;
  currentScene?: string;

  constructor(props: CharacterProps) {
    this.uid = props.uid ?? v4();
    this.name = props.name;
    this.sex = props.sex;
    this.age = props.age;
    this.height = props.height;
    this.weight = props.weight;
    this.bodyDesc = props.bodyDesc;
    this.job = props.job;
    this.personality = props.personality;
    this.otherDesc = props.otherDesc;
    this.experience = props.experience;
    this.currentStatusDesc = props.currentStatusDesc;
    this.currentScene = props.currentScene;
  }
}
