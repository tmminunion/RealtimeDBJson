module.exports = async (req, res) => {
    const brands = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'BMW', 'Vespa', 'KTM', 'Aprilia', 'Harley Davidson'];
    const types = ['Vario', 'NMAX', 'Ninja', 'GSX', 'Panigale', 'S 1000 RR', 'Primavera', 'Duke', 'RSV4', 'Street Glide'];
    const series = ['150', '250', '600', '1000', 'ABS', 'Turbo', 'Limited Edition', 'Sport', 'RR', 'ZX'];

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const namaMotor = `${random(brands)} ${random(types)} ${random(series)}`;

    res.json({
        success: true,
        message: "Nama motor berhasil dibuat",
        data: {
            nama: namaMotor
        }
    });
};