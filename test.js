const x = {
    val: 2
  };
  
  const x1 = x => Object.assign({}, x, { val: x.val + 1});
  
  const x2 = x => Object.assign({}, x, { val: x.val * 2});
  
  console.log(x2(x1(x)).val); // 5
  