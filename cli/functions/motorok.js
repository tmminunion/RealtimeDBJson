module.exports = async (req, res) => {
    const brands = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Ducati', 'BMW', 'Harley-Davidson', 'Triumph', 'KTM', 'Aprilia'];
    const models = ['CBR', 'YZF', 'GSX', 'Ninja', 'Panigale', 'S1000', 'Sportster', 'Tiger', 'Duke', 'Tuono'];
    const series = ['R', 'RR', 'RT', 'Adventure', 'Special Edition', 'Pro', 'Max', 'Street', 'Custom', 'GT'];
    const displacements = ['150', '250', '400', '600', '1000', '1250'];

    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomModel = models[Math.floor(Math.random() * models.length)];
    const randomSeries = series[Math.floor(Math.random() * series.length)];
    const randomCC = displacements[Math.floor(Math.random() * displacements.length)];

    const generatedName = randomBrand + ' ' + randomModel + '-' + randomCC + ' ' + randomSeries;

    res.json({
        success: true,
        message: "Nama motor berhasil dibuat",
        data: {
            name: generatedName,
            brand: randomBrand,
            model: randomModel,
            cc: randomCC,
            series: randomSeries
        }
    });
};