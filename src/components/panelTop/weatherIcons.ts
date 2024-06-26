import o1d from "../../../public/whetherIcons/01d.png";
import o2d from "../../../public/whetherIcons/02d.png";
import o3d from "../../../public/whetherIcons/03d.png";
import o4d from "../../../public/whetherIcons/04d.png";
import o9d from "../../../public/whetherIcons/09d.png";
import o10d from "../../../public/whetherIcons/10d.png";
import o11d from "../../../public/whetherIcons/11d.png";
import o13d from "../../../public/whetherIcons/13d.png";
import o50d from "../../../public/whetherIcons/50d.png";
import o1n from "../../../public/whetherIcons/01n.png";
import o2n from "../../../public/whetherIcons/02n.png";
import o3n from "../../../public/whetherIcons/03n.png";
import o4n from "../../../public/whetherIcons/04n.png";
import o9n from "../../../public/whetherIcons/09n.png";
import o10n from "../../../public/whetherIcons/10n.png";
import o11n from "../../../public/whetherIcons/11n.png";
import o13n from "../../../public/whetherIcons/13n.png";
import o50n from "../../../public/whetherIcons/50n.png";
import unknown from "../../../public/whetherIcons/jdwi-unknown.png";
import { StaticImageData } from "next/image";

export const WeatherIcons: {
  [key: string]: StaticImageData;
} = {
  "01d": o1d,
  "02d": o2d,
  "03d": o3d,
  "04d": o4d,
  "09d": o9d,
  "10d": o10d,
  "11d": o11d,
  "13d": o13d,
  "50d": o50d,
  "01n": o1n,
  "02n": o2n,
  "03n": o3n,
  "04n": o4n,
  "09n": o9n,
  "10n": o10n,
  "11n": o11n,
  "13n": o13n,
  "50n": o50n,
  default: unknown,
};
