var tableNumber = null;

AFRAME.registerComponent("marker-handler",{
    init:async function(dishes,markerId){
        if(tableNumber === null){
            this.askTableNumber();
        }

        var dishes = await this.getDishes();

        this.el.addEventListener("markerFound",()=>{
            if(tableNumber !== null){
                var markerId = this.el.id;
                console.log("Marker is found!")
                this.handleMarkerFound(dishes,markerId);
            }
        })
        this.el.addEventListener("markerLost",()=>{
            console.log("Marker is lost!")
            this.handleMarkerLost();
        })
    },

    askTableNumber:function(){
        var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
        swal({
            title:"Welcome To Hunger!",
            icon:iconUrl,
            content:{element:"input",
            attributes:{
                placeholder:"Type Your Table Number",
                type:"number",
                min:1
            }},
            closeOnClickOutside:false,
        })
        .then(inputValue=>{
            tableNumber = inputValue;
        })
    },

    handleMarkerFound:function(dishes,markerId){
        var todaysDate = new Date();
        var todaysDay = todaysDate.getDay();
        var days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]

        var dish = dishes.filter(dish=>dish.id===markerId)[0];

        //checks whether day is present in the array - include function
        if(dish.unavailable_days.includes(days)[todaysDay]){
            swal({
                icon:"warning",
                title:dish.dish_name.toUpperCase(),
                text:"The Dish is Not available today",
                timer:2500,
                buttons:false
            })
        } else {

        }

        var buttonDiv=document.getElementById("button-div")
        buttonDiv.style.display = "flex";
        var ratingButton = document.getElementById("rating-button")
        var orderButton = document.getElementById("order-button")

        ratingButton.addEventListener("click",function(){
            swal({
                icon:"warning",
                title:"Rate Dish",
                text:"Work In Progress"
            })
        })

        orderButton.addEventListener("click",function(){
            var tnumber;
            tableNumber<=9 ? (tnumber=`T0${tableNumber}`):`T${tableNumber}`
            this.handleOrder(tnumber,dish)
            swal({
                icon:"https://i.imgur.com/4NZ6uLY.jpg",
                title:"Thanks for Ordering!",
                text:"Your Order Will be served soon at your table",
                timer:2000,
                buttons:false
            })
        })
    },

    getDishes:async function(){
        return await firebase
        .firestore()
        .collection("tables")
        .get()
        .then(snap=>{
            return snap.docs.map(doc=>doc.data())
        })
    },

    handleMarkerLost:function(){
        var buttonDiv = document.getElementById("button-div")
        buttonDiv.style.display = "none"
    },

    handleOrder:function(tnumber,dish){
        firebase.firestore.collection("tables")
        .doc(tnumber)
        .get()
        .then(doc=>{
            var details = doc.data();
            if(details["current_orders"][dish.id]){
                details["current_orders"][dish.id]["quantity"] +=1
                var current_quantity = details["current_orders"][dish.id]["quantity"];
                details["current_order"][dish.id]["subtotal"] = current_quantity*dish.price;
            } else{
                details["current_orders"][dish.id] = {
                    item:dish.dish_name,
                    price:dish.price,
                    quantity:1,
                    subtotal:dish.price*1
                }
            }

            details.total_bill += dish.price
            firebase.firestore().collection("tables").doc(doc.id)
            .update(details)
        })
    }
})