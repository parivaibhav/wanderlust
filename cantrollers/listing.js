const Listing = require("../models/listing.js");

module.exports.homeRoute = async (req, res) => {
    res.redirect("/listings/index.ejs");
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    // Modify each image URL to be responsive and fill using Cloudinary transformations
    const listingsWithResponsiveImages = allListings.map(listing => {
        let imageUrl = listing.image?.url;
        if (imageUrl) {
            // Add 'c_fill,w_600,h_400' for fill and responsive size
            imageUrl = imageUrl.replace("/upload", "/upload/c_fill,w_600,h_400");
        }
        return { ...listing.toObject(), image: { ...listing.image, url: imageUrl } };
    });
    res.render("listings/index", { allListings: listingsWithResponsiveImages });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing Not Exists!");
        return res.redirect("/listings");
    }
    // Reduce image quality for display
    let imageUrl = listing.image?.url;
    if (imageUrl) {
        imageUrl = imageUrl.replace("/upload", "/upload/h_300,w_300/q_20");
    }
    res.render("listings/show.ejs", { listing, imageUrl });
}

module.exports.createListing = async (req, res, next) => {
    try {
        let url = req.file?.path;
        let filename = req.file.filename;

        // Modify Cloudinary image URL to reduce quality and size
        if (url) {
            url = url.replace("/upload", "/upload/h_300,w_300/q_20");
        }

        const newListing = new Listing(req.body.listing);
        // Set the current logged-in user as the owner
        newListing.owner = req.user._id;
        newListing.image = { url, filename }
        await newListing.save();

        req.flash("success", "new listing created!")
        res.redirect("/listings");
    } catch (err) {
        if (res.headersSent) {
            return next(err);
        }
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(e => e.message).join(", ");
            return res.status(400).render("error.ejs", { err: new ExpressError(400, messages) });
        }
        next(err);
    }
}


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Exists!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_300/q_20")
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {

    const { id } = req.params;
    let listing = await Listing.findById(id);
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file?.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated SuccessFully!")
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);

    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) throw new ExpressError(404, "Listing not found");
    req.flash("error", "Listing Deleted Sucessfully!")
    res.redirect("/listings");
}

module.exports.searchListing = async (req, res) => {
    const searchQuery = req.query.q || '';

    try {
        const allListings = await Listing.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { location: { $regex: searchQuery, $options: 'i' } },
                { country: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.render('listings/index', { allListings, searchQuery }); // Render your view
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
