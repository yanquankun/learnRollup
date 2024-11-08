import { add } from "./../common/common.js";
// 只引入对应的包，减少打包的体积
import _ from "lodash/add.js";

console.log(_(123, 321));
const sum = add(1, 2);
console.log(sum);
const str = "BundelA";
export default str;
