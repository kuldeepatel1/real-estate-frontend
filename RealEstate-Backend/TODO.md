# TODO - Property Sold/Pending Implementation

## Task: Add sold/pending methods and routes for properties

### DAO Methods to Add:
- [x] Add `mark_property_sold(property_id)` method to PropertyDAO
- [x] Add `mark_property_pending(property_id)` method to PropertyDAO
- [x] Add `get_sold_properties()` method to PropertyDAO
- [x] Add `get_pending_properties()` method to PropertyDAO

### Controller Routes to Add:
- [x] Add `PUT /api/properties/<int:property_id>/sold` route
- [x] Add `PUT /api/properties/<int:property_id>/pending` route
- [x] Add `GET /api/properties/sold` route
- [x] Add `GET /api/properties/pending-status` route

## Progress:
- [x] Edit property_dao.py
- [x] Edit property_controller.py

## Implementation Complete ✓
All sold/pending methods and routes have been successfully added to the project.

