module.exports = async (req, res) => {
    const listDepan = ["Aruna", "Zio", "Kala", "Gama", "Sena", "Nara", "Keano", "Zea", "Aira", "Lyra", "Alaric", "Kenzie", "Athesa", "Bumi", "Langit"];
    const listTengah = ["Abinaya", "Baskara", "Cahaya", "Dewangga", "Elang", "Fajar", "Gemintang", "Harsa", "Ishana", "Jatmika", "Karsa", "Lazuardi"];
    const listBelakang = ["Adiguna", "Pratama", "Wibowo", "Kusuma", "Saputra", "Wijaya", "Mahendra", "Suwarna", "Yudistira", "Prawira"];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const namaLengkap = `${getRandom(listDepan)} ${getRandom(listTengah)} ${getRandom(listBelakang)}`;

    res.json({
        status: "success",
        data: {
            nama: namaLengkap,
            gender: req.query.gender || "unisex",
            arti_singkat: "Anak yang membawa cahaya dan kebahagiaan bagi keluarga"
        },
        message: "Nama anak kekinian berhasil digenerate"
    });
};