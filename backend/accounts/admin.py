from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, VendorProfile, CustomerProfile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'name', 'phone', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Trust Khata Profile', {'fields': ('role', 'phone', 'name')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(VendorProfile)
admin.site.register(CustomerProfile)
