const Review = require('../models/Review');
const Property = require('../models/Property');

const recalcRating = async (propertyId) => {
  const stats = await Review.aggregate([
    { $match: { property: propertyId } },
    { $group: { _id: '$property', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const property = await Property.findById(propertyId);
  if (!property) return;
  property.ratingAvg = stats.length ? Math.round(stats[0].avg * 10) / 10 : 0;
  property.ratingCount = stats.length ? stats[0].count : 0;
  await property.save();
};

// @desc    Add a review for a property (user)
// @route   POST /api/reviews/property/:propertyId
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: 'rating is required' });

    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const existing = await Review.findOne({ property: property._id, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }

    const review = await Review.create({
      property: property._id,
      user: req.user._id,
      rating,
      comment,
    });

    await recalcRating(property._id);

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a review (owner of review, or admin)
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const propertyId = review.property;
    await review.deleteOne();
    await recalcRating(propertyId);

    res.json({ message: 'Review removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { addReview, getReviews, deleteReview };
