(async () => {

    //===========================
    // Lấy shopId và itemId
    //===========================

    const match = location.href.match(/i\.(\d+)\.(\d+)/);

    if (!match) {
        console.error("Không lấy được shopId/itemId");
        return;
    }

    const shopid = match[1];
    const itemid = match[2];

    //===========================
    // Gọi API
    //===========================

    const response = await fetch(
        `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
        {
            credentials: "include"
        }
    );

    const item = await response.json();

    //===========================
    // Description từ DOM
    //===========================

    let description = "";

    const paragraphs = document.querySelectorAll("p.QN2lPu");

    if (paragraphs.length > 0) {

        description = [...paragraphs]
            .map(p => p.innerText.trim())
            .join("\n");

    } else {

        description = item.description || "";

    }

    //===========================
    // Build JSON
    //===========================

    const product = {

        shopid: Number(shopid),

        itemid: Number(itemid),

        name: item.name,

        brand: item.brand,

        price: item.price / 100000,

        stock: item.stock,

        sold: item.historical_sold,

        description,

        image:
            item.image
                ? `https://down-vn.img.susercontent.com/file/${item.image}`
                : null,

        images:
            (item.images || []).map(id =>
                `https://down-vn.img.susercontent.com/file/${id}`
            ),

        category:
            (item.categories || []).map(c => c.display_name)

    };

    console.clear();

    console.log(product);

    console.table(product.images);

console.log(JSON.stringify(product, null, 2));
    console.log("✅ Copied to clipboard");

})();