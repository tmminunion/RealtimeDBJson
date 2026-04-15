module.exports = async (req, res) => {
    const brands = ["Toyota", "Honda", "Tesla", "BMW", "Ford", "Audi", "Nissan", "Hyundai", "Mercedes", "Porsche"];
    const models = ["X1", "Civic", "Model 3", "Mustang", "Corolla", "A4", "Skyline", "Elantra", "S-Class", "911"];
    const colors = ["Silver", "Black", "White", "Blue", "Red", "Grey"];
    const years = ["2020", "2021", "2022", "2023", "2024"];

    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomModel = models[Math.floor(Math.random() * models.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomYear = years[Math.floor(Math.random() * years.length)];

    const fullName = `${randomBrand} ${randomModel} ${randomColor} (${randomYear})`;

    res.json({
        status: "success",
        data: {
            brand: randomBrand,
            model: randomModel,
            color: randomColor,
            year: randomYear,
            full_name: fullName
        }
    });
};