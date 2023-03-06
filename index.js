var express = require('express')
var ejs = require('ejs')
var mysql = require('mysql');
var session = require('express-session');
//la connexion $
mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'node_projeect'
});
var bodyParser = require('body-parser');
const { get } = require('request');

var app = express();//express function for create a local server 
app.use(session({secret:"secret"}));
//to use html and css and img in our app 
app.use(express.static('public'));
app.set('view engine','ejs');

//port linadniro 
app.listen(8080);
//localhost:8080
app.use(bodyParser.urlencoded({extended:true}));
/*app.get('/',function(_req,res)
{
   var con =  mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'node_projeect'
    });
    con.query('SELECT * FROM product',(_err,result)=>
    {res.render('pages/index',{result:result}); })
   
    //return something to user 
    //res.send("Hello");
    //i wanna return the index html 
    
   
}); */
function isPoductInCart(cart , id){
for(let i=0; i<cart.length;i++){
if(cart[i].id==id){
    return true;
}
}
return false;

}
function calculateTotal(cart,req){
    total = 0;
    for( let i=0;i<cart.length;i++){
        //if we 'ree offering a discounted price 
   if(cart[i].sale_price){
    total = total+(cart[i].sale_price*cart[i].quantity);
   }else{
    total = total+(cart[i].price*cart[i].quantity)
}
}
    req.session.total = total;
    return total;
}
app.get('/', function(_req, res) {
    var con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'node_projeect'
    });
    
    con.query('SELECT * FROM product', function(err, result) {
      if (err) {
        console.error(err);
        return;
      }
  
      console.log(result);
      res.render('pages/index',
       { result: result });
    });
  });
  app.post('/add_to_cart',function(req,res){
    var id= req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var quantity = req.body.quantity;
    var image1 = req.body.image1;
    var product = {id:id,name:name,price:price,sale_price:sale_price,quantity:quantity,image1:image1};

    if(req.session.cart){
        var cart = req.session.cart;
        if(!isPoductInCart(cart,id)){
            cart.push(product);
        }
    }
        else{
            req.session.cart = [product]
            var cart = req.session.cart;

        }
        //calculate total 
        calculateTotal(cart,req);
        console.log('cart:', cart);

        //return to cart page
        res.redirect('/cart');
    
  });
  app.get('/cart',function(req,res){
    var cart = req.session.cart;
    var total = req.session.total;
    res.render('pages/cart',{cart:cart,total:total});
  });
  app.post('/remove_product',function(req,res){
   var id = req.body.id;
   var cart = req.session.cart;
   for(let i =0 ; i<cart.length;i++){
    if(cart[i].id == id){
        cart.splice(cart.indexOf(i),1);
    }
   }
//recalculate the total 
calculateTotal(cart,req);
res.redirect('/cart');

  });
  app.post('/edit_product_quantity',function(req,res){
  //get values from inputs
  var id = req.body.id;
  var quantity = req.body.quantity;
  var increase_btn = req.body.increase_product_quantity;
  var decrease_btn = req.body.decrease_product_quantity;
  var cart = req.session.cart;
  if(increase_btn){
    for(let i =0;i<cart.length;i++){
        if(cart[i].id == id ){
            if(cart[i].quantity>0){
                cart[i].quantity = parseInt(cart[i].quantity)+1;
            }
        }
    }
  }
  if(decrease_btn){
    for(let i =0;i<cart.length;i++){
        if(cart[i].id == id ){
            if(cart[i].quantity>1){
                cart[i].quantity = parseInt(cart[i].quantity)-1;
            }
        }
    }
  }
 calculateTotal(cart,req);
res.redirect('/cart');

  })


  app.get('/checkout',function(req,res){
    var total = req.session.total;

    res.render('pages/checkout',{total:total})
  })

  app.post('/place_order',function(req,res){
    
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var city = req.body.city;
    var address = req.body.address;
     var cost = req.session.total;
     var sttattus = "not paid";
     var date = new Date();
     var products_ids ="";
    var con =  mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'node_projeect'
    })
    var cart = req.session.cart;
    for(let i =0; i<cart.length;i++){
        products_ids = products_ids +','+cart[i].id;
    }
    con.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        var query = "INSERT INTO orders (cost,name,email,sttattus,city,address,phone,date,products_ids) VALUES ?";
        var values = [ 
        [cost,name,email,sttattus,city,address,phone,date,products_ids]
    ];
        con.query(query,[values],(err,result)=>{
            res.redirect('/payment');
           // console.log(result);
        })
    }

    })


  })
  app.get('/payment',function(req,res){
    res.render('pages/payment')
  })
  