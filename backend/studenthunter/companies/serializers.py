from rest_framework import serializers
from .models import Company, CompanyReview, CompanyBenefit

class CompanyBenefitSerializer(serializers.ModelSerializer):
    """Serializer for company benefits."""
    
    class Meta:
        model = CompanyBenefit
        fields = ['id', 'title', 'description']


class CompanyReviewSerializer(serializers.ModelSerializer):
    """Serializer for company reviews."""
    reviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyReview
        fields = [
            'id', 'company', 'reviewer', 'reviewer_name', 'title', 'content',
            'rating', 'pros', 'cons', 'is_anonymous', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reviewer', 'created_at', 'updated_at']
    
    def get_reviewer_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"
    
    def create(self, validated_data):
        # Set the reviewer to the current user
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for companies."""
    benefits = CompanyBenefitSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'description', 'website', 'logo', 'banner',
            'location', 'industry', 'company_size', 'founded_year',
            'linkedin', 'twitter', 'facebook', 'instagram',
            'created_at', 'updated_at', 'owner', 'benefits',
            'average_rating', 'reviews_count', 'verified', 'contact_email', 'contact_phone', 'culture'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'owner']
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return sum(review.rating for review in reviews) / len(reviews)
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()
    
    def create(self, validated_data):
        # Set the owner to the current user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class CompanyDetailSerializer(CompanySerializer):
    """Detailed serializer for companies."""
    reviews = CompanyReviewSerializer(many=True, read_only=True)
    
    class Meta(CompanySerializer.Meta):
        fields = CompanySerializer.Meta.fields + ['reviews']
