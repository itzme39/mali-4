/* Perspective camera at the center of a volume of memories. No libraries. */
const World360 = {
  project(x, y, z, yaw, pitch, width, height) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const rx = x * cy - z * sy;
    const forward = x * sy + z * cy;
    const ry = y * cp - forward * sp;
    const depth = y * sp + forward * cp;
    if (depth <= 60) return null;
    const focal = Math.min(width * .82, height * .78);
    return {x: width / 2 + rx * focal / depth,
      y: height / 2 - ry * focal / depth, scale: focal / depth, depth};
  },
  quaternion(alpha, beta, gamma) {
    const a=alpha*Math.PI/360,b=beta*Math.PI/360,g=gamma*Math.PI/360;
    const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cg=Math.cos(g),sg=Math.sin(g);
    return [ca*sb*cg-sa*cb*sg,ca*cb*sg+sa*sb*cg,sa*cb*cg+ca*sb*sg,ca*cb*cg-sa*sb*sg];
  },
  relative(base, q) {
    const [ax,ay,az,aw]=[-base[0],-base[1],-base[2],base[3]], [bx,by,bz,bw]=q;
    const x=aw*bx+ax*bw+ay*bz-az*by;
    const y=aw*by-ax*bz+ay*bw+az*bx;
    const z=aw*bz+ax*by-ay*bx+az*bw;
    const w=aw*bw-ax*bx-ay*by-az*bz;
    return {yaw:Math.atan2(-2*(x*z+w*y),1-2*(x*x+y*y)),pitch:Math.asin(Math.max(-1,Math.min(1,2*(w*x-y*z))))};
  }
};
if (typeof module !== 'undefined') module.exports=World360;
