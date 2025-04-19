# Django Backend Instructions: Allow All HTTP Methods

To allow all HTTP methods (GET, POST, PUT, PATCH, DELETE) on all endpoints in your Django REST Framework backend, follow these instructions:

## 1. Create a Custom Permission Class

Create a file called `permissions.py` in your main Django app folder (where your `views.py` is located) with the following content:

```python
from rest_framework import permissions

class AllowAnyMethodPermission(permissions.AllowAny):
    """
    Allow any access regardless of HTTP method.
    """
    def has_permission(self, request, view):
        return True
```

## 2. Update Your ViewSets

Find all your ViewSet classes in your `views.py` file and add this permission class:

```python
from .permissions import AllowAnyMethodPermission

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAnyMethodPermission]
    # Add this line to explicitly allow all HTTP methods
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
```

## 3. Add Custom Actions for List Methods

To specifically allow GET requests on list endpoints, add a custom action to each ViewSet:

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class PatientViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    @action(detail=False, methods=['get'])
    def list_all(self, request):
        """Custom endpoint to get all patients"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

## 4. Global DRF Settings

Add these settings to your project's `settings.py` file to globally allow all methods:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'app_name.permissions.AllowAnyMethodPermission',  # Replace app_name with your app name
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
}
```

## 5. Function-Based Views Alternative

If you're using function-based views instead of ViewSets, use the `@api_view` decorator to allow all methods:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def patient_list(request):
    """
    List all patients or create a new one.
    """
    if request.method == 'GET':
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## 6. Override the `get_permissions` Method

For more dynamic control, override the `get_permissions` method in your ViewSets:

```python
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    
    def get_permissions(self):
        """Allow any method regardless of the endpoint"""
        return [AllowAnyMethodPermission()]
```

## 7. Apply CORS Headers

Make sure your Django application has CORS headers properly configured to allow all methods:

```python
# Install django-cors-headers if not already installed
# pip install django-cors-headers

# Add to INSTALLED_APPS in settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

# Add middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# Configure CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

These changes should allow all HTTP methods on all endpoints in your Django REST Framework application. After making these changes, restart your Django server to apply them. 