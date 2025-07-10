import os
import importlib
import inspect
from typing import List, Dict, Any, Optional

# A cache to avoid re-discovering scrapers on every request
_scraper_cache: Dict[str, Any] = {}

def discover_scrapers() -> Dict[str, Any]:
    """
    Dynamically discovers, imports, and validates scraper modules from the 'scrapers' directory.
    
    A valid scraper module must contain:
    - A `SOURCE_NAME` (str)
    - A `get_article_urls` function
    - A `scrape_article_content` function

    Returns:
        A dictionary mapping the scraper's SOURCE_NAME to its imported module object.
    """
    global _scraper_cache
    if _scraper_cache:
        return _scraper_cache

    discovered_scrapers: Dict[str, Any] = {}
    scrapers_dir = "scrapers"
    
    for filename in os.listdir(scrapers_dir):
        if filename.endswith('_scraper.py') and not filename.startswith('__'):
            module_name = f"{scrapers_dir}.{filename[:-3]}"
            print(f"Attempting to import scraper module: {module_name}")
            try:
                module = importlib.import_module(module_name)
                
                # Validate that the module has all the required components
                if (hasattr(module, 'SOURCE_NAME') and isinstance(getattr(module, 'SOURCE_NAME'), str) and
                    hasattr(module, 'get_article_urls') and inspect.isfunction(getattr(module, 'get_article_urls')) and
                    hasattr(module, 'scrape_article_content') and inspect.isfunction(getattr(module, 'scrape_article_content'))):
                    
                    source_name = getattr(module, 'SOURCE_NAME')
                    if source_name in discovered_scrapers:
                        print(f"Warning: Duplicate scraper source name '{source_name}' found. Overwriting.")
                    discovered_scrapers[source_name] = module
                else:
                    print(f"Warning: Scraper module {module_name} is missing required attributes and will be ignored.")

            except ImportError as e:
                print(f"Error importing scraper {module_name}: {e}")

    _scraper_cache = discovered_scrapers
    return _scraper_cache

def get_all_scraper_names() -> List[str]:
    """Returns a sorted list of names for all valid, discovered scrapers."""
    scrapers = discover_scrapers()
    return sorted(list(scrapers.keys()))

def get_scraper_modules(names: Optional[List[str]] = None) -> List[Any]:
    """
    Retrieves scraper modules based on a list of names.

    Args:
        names: A list of scraper names to retrieve. If None, all scrapers are returned.

    Returns:
        A list of the requested scraper module objects.
    """
    all_scrapers = discover_scrapers()
    if names is None:
        return list(all_scrapers.values())

    selected_modules = []
    for name in names:
        module = all_scrapers.get(name)
        if module:
            selected_modules.append(module)
        else:
            print(f"Warning: Requested scraper '{name}' not found and will be skipped.")
            
    return selected_modules