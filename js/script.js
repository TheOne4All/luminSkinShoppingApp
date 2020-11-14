// let currencyChange = document.querySelector(".modal .currency-select");
// currencyChange.addEventListener("change", function () {
//   // console.log(currencyChange.value);
//   console.log(currencyChange.value);
// });
function luminDefault($i = "USD") {
  // Create the client, specify the endpoint URL
  client = GraphQL.makeClient("https://pangaea-interviews.now.sh/api/graphql");

  // Create and Assign GraphQL query variable
  let query = "query {products {image_url title price(currency: " + $i + ")}}";

  // Pass the query and a callback to handle the response
  client.query(query, function (response) {
    // The container holding the query list products item and Currency
    let groupListProduct = document.querySelectorAll(
      "#content .single-product"
    );
    let currencyElem = document.querySelectorAll(".currency");
    let priceElem = document.querySelectorAll(".price-tag");

    // iterate through the response to create product items
    Object.entries(response).forEach(([key, val]) => {
      for (let i = 0; i < val["products"].length; i++) {
        const element = val["products"][i];
        image_url = element["image_url"];
        title = element["title"];
        price = element["price"];
        counter = i;
        currency = $i;

        // Check if listed products exist
        if (groupListProduct.length == 0) {
          createSingleProductDOM();
        } else {
          currencyElem[i].innerHTML = currency;
          priceElem[i].innerHTML = parseFloat(price, 2).toLocaleString("en");
        }
      }
    });

    // Change Currency value in template
    document.querySelector(".subtotal .currency").innerHTML = $i;

    // Check if currency changed so as to change price in itemCart
    let oldCurrencyStat = document.querySelector(".subtotal .currency");
    let itemQuantityDiv = document.querySelectorAll(".quantity");
    if (itemQuantityDiv !== null) {
      for (let i = 0; i < itemQuantityDiv.length; i++) {
        itemQuantityDiv[i].querySelector(".price .currency").innerHTML = $i;
        // Change price of item on cart
        itemQuantityDiv[i].querySelector(
          ".price span"
        ).innerHTML = document.querySelector(
          "#content ." +
            itemQuantityDiv[i].getAttribute("data-fetch") +
            " .price-tag"
        ).textContent;
      }
    }

    toggleCartModal();
    addToCart();
  });
}

// Create product item HTML element template
function createSingleProductDOM() {
  // Create container to hold listed product
  let listProducts = document.getElementById("content");
  let createSingleProduct = document.createElement("div");
  createSingleProduct.classList.add(
    "single-product",
    "col-md-4",
    "item_" + counter
  );

  // Create and assign values to the Various HTML elements and nodes
  createSingleProduct.innerHTML =
    '<div class="product-image-container"><img src="' +
    image_url +
    '" class="product-image"></div><h3 class="product-title">' +
    title +
    '</h3><p class="single-product-price">From <span class="price-tag">' +
    parseFloat(price, 2).toLocaleString() +
    '</span> <b class="currency">' +
    currency +
    '</b></p><button class="btn btn-primary" data-fetch="item_' +
    counter +
    '">Add to Cart</button>';
  listProducts.appendChild(createSingleProduct);
}

// Toggle between cart content slide-sidebar
function toggleCartModal() {
  let cartBtn = document.querySelector(".cart .cartBtn");
  let targetModal = document.getElementById("cartSlideBar");
  // console.log(targetModal);
  cartBtn.addEventListener("click", function () {
    targetModal.classList.add("show");
    targetModal.style.display = "block";
    document.querySelector("html").style.overflow = "hidden";
  });

  document.querySelector(".closeModal").addEventListener("click", function () {
    targetModal.classList.remove("show");
    setTimeout(function () {
      targetModal.style.display = "none";
      document.querySelector("html").style.overflow = "auto";
    }, 300);
  });
}

// This method helps add product onClick to Cart Items
function addToCart() {
  //  Select All Add To Cart buttons and iterate click event listener
  let addToCartBtn = document.querySelectorAll("button[data-fetch*='item_']");

  for (let i = 0; i < addToCartBtn.length; i++) {
    addToCartBtn[i].addEventListener("click", function () {
      // Remove style of empty cart if visible
      if (
        (document.querySelector(".modal .emptyCart").style.display = "block")
      ) {
        document.querySelector(".modal .emptyCart").style.display = "none";
      }

      // Get all necessary variables from clicked item product and list Cart sub-total
      let itemID = addToCartBtn[i].getAttribute("data-fetch");
      let itemSelect = document.querySelector("#content ." + itemID);
      let itemImage_url = itemSelect.querySelector(".product-image").src;
      let itemPrice = parseFloat(
        itemSelect.querySelector(".price-tag").textContent,
        2
      );
      let itemTitle = itemSelect.querySelector(".product-title").textContent;
      let itemCurrency = itemSelect.querySelector(".currency").textContent;

      // fire the function to create cart item and generate cart item quantity count
      createSingleCartItemDOM({
        itemID: itemID,
        itemImage_url: itemImage_url,
        itemPrice: itemPrice,
        itemTitle: itemTitle,
        itemCurrency: itemCurrency,
      });

      // Compute and Display results in various respective elements
      calcSubTotal();

      // Slide open the List Cart Modal window
      let listCartModal = document.getElementById("cartSlideBar");
      listCartModal.classList.add("show");
      listCartModal.style.display = "block";
      document.querySelector("html").style.overflow = "hidden";

      // Increment and Decrement List Cart items by clicks
      let incrementBtn = document.querySelector(
        "#list-cart-items ." + itemID + " .quantity .increment"
      );
      let decrementtBtn = document.querySelector(
        "#list-cart-items ." + itemID + " .quantity .decrement"
      );
      incrementBtn.addEventListener("click", function () {
        createSingleCartItemDOM({
          itemID: itemID,
        });
        calcSubTotal();
      });
      decrementtBtn.addEventListener("click", function () {
        createSingleCartItemDOM({
          itemID: itemID,
          action: "minus",
        });
        calcSubTotal();
      });
    });
  }
}

// Create Item to add to Cart List and return quantity count
function createSingleCartItemDOM({
  itemID: itemID = null,
  itemImage_url: itemImage_url = null,
  itemPrice: itemPrice = null,
  itemTitle: itemTitle = null,
  itemCurrency: itemCurrency = null,
  action: action = "add",
}) {
  // Get List Cart Items container element
  let listCartItems = document.querySelector("#list-cart-items");
  if (listCartItems.querySelector("." + itemID) !== null) {
    //get the quantity of item selected and increment it
    let itemQuantity = listCartItems.querySelector(
      "." + itemID + " .quantity-selector .counter"
    ).textContent;
    // Increase or Decrease quntity
    if (action == "add") {
      itemQuantity = parseInt(itemQuantity) + 1;
    } else if (action == "minus") {
      itemQuantity = parseInt(itemQuantity) - 1;
      if (itemQuantity < 1) {
        listCartItems.removeChild(listCartItems.querySelector("." + itemID));
      }
    } else {
      alert("Wrong Action Operator!");
    }
    if (itemQuantity >= 1) {
      listCartItems.querySelector(
        "." + itemID + " .quantity-selector .counter"
      ).innerHTML = itemQuantity;
    }
  } else {
    let createSingleCartItem = document.createElement("div");
    createSingleCartItem.classList.add("card-body");
    createSingleCartItem.classList.add(itemID);
    createSingleCartItem.innerHTML =
      '<div class="cart-item row"><div class="col-sm-12 list-item-close"><i class="feather icon-x"></i></div></i><div class="product-description col-sm-8"><h6>' +
      itemTitle +
      '</h6><div><span class="product-personalize">MADE FOR:</span> Ama Eze</div><div>Combination</div><div>Two Month supply shipped every two months</div><div>Cancel or change frequency anytime</div></div><div class="product-image col-sm-4"><img src="' +
      itemImage_url +
      '" /></div><div class="quantity col-sm-12" data-fetch="' +
      itemID +
      '"><div class="quantity-selector"><span class="decrement">-</span><span class="counter">1</span><span class="increment">+</span></div><div class="price"><span>' +
      parseFloat(itemPrice, 2).toLocaleString() +
      '</span> <e class="currency">' +
      itemCurrency +
      "</e></div></div></div>";
    listCartItems.appendChild(createSingleCartItem);
  }
}

function calcSubTotal() {
  let subtotal = 0;
  let quantityTotal = 0;
  let price = 0;
  let quantity = 0;
  let listCartItems = document.querySelectorAll("#list-cart-items .card-body");
  if (listCartItems !== null) {
    for (let i = 0; i < listCartItems.length; i++) {
      price = listCartItems[i].querySelector(".quantity .price span")
        .textContent;
      quantity = listCartItems[i].querySelector(".quantity .counter")
        .textContent;
      quantityTotal = quantityTotal + parseInt(quantity);
      subtotal = parseFloat(price, 2) * parseInt(quantity) + subtotal;
    }
  } else {
    subtotal = 0;
  }
  document.querySelector(
    ".subtotal .subtotal-amount span"
  ).innerHTML = parseFloat(subtotal, 2).toLocaleString("en");

  if (
    (document.querySelector("#topbar .cart .notice").style.display = "none")
  ) {
    document.querySelector("#topbar .cart .notice").style.display = "block";
  }
  document.querySelector("#topbar .cart .notice").innerHTML = quantityTotal;
}

// Initialize the functions
function init() {
  luminDefault();
}

init();
