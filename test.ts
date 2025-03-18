let a = setTimeout(async () => {
    await new Promise(r => setTimeout(r, 1000));
    console.log("helo yam");
}, 0);

(async () => {
    await new Promise(r => setTimeout(r, 900));
    clearTimeout(a);

    await new Promise(r => setTimeout(r, 6000));
    console.log("selesai");
})();
