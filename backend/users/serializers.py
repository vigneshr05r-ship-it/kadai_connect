from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=False, allow_blank=True)
    # Redefine username to remove the default UniqueValidator so our custom validate() runs
    username = serializers.CharField(required=False, allow_blank=True, validators=[])

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'district', 'address', 'password', 'name', 'pincode', 'shift', 'vehicle_type', 'vehicle_reg_no', 'license_number', 'fcm_token')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, # Password not required for updates
            'email': {'required': True},
            'username': {'required': False},
        }

    def validate_email(self, value):
        user = self.context.get('request').user if self.context.get('request') else None
        # Check email uniqueness, excluding current user if updating
        qs = User.objects.filter(email=value)
        if user and user.pk:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        # Only auto-generate username for NEW users (if username not provided)
        is_update = self.instance is not None
        
        if not is_update:
            if not attrs.get('username'):
                email = attrs.get('email', '')
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                attrs['username'] = username
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
