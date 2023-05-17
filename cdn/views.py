from django.views.decorators.cache import never_cache
from django.http import HttpResponse
from .models import JavaScriptFile

@never_cache
def javascript_file_view(request, file_slug):
    javascript_file = JavaScriptFile.objects.get(slug=file_slug)
    
    with javascript_file.file.open() as file:
        content = file.read().decode()

    response = HttpResponse(content=content, content_type='application/javascript')
    return response
