console.log(1);
setTimeout(() => {
  console.log(2);
});
console.log(3);
Promise.resolve().then(() => {
  console.log(4);
});
console.log(5);

for (var i = 0; i < 5; i++) {
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 0);
  })(i);
}

const x = { x: ["hello", "world", { y: () => "secret" }] };

const a = {
  x: 1,
  y: "2",
  z: { prop: 20 },
};

const b = { ...a, z: { ...a.z } };

a.z.prop++;
console.log(b.z.prop);
// promise resolve after 10 seconds but try and catch
// how to print hello world
const method = (data, delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(data), delay);
  });
};

const func = async () => {
  const d1 = await method("hello", 1000);
  const d2 = await method("world", 2000);

  console.log(d1 + " " + d2);
};
func();
