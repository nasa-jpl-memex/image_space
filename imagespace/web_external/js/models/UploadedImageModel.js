/**
 * This model represents an uploaded image, which is very similar to the
 * generic ImageModel with a few exceptions.
 *
 * - An uploaded image may not have as many searches available to it due to
 *   external service limitations.
 * - An uploaded image run through Tika locally may have different fields on it
 *   than in a Solr index, this model performs mapping to make them consistent.
 **/
imagespace.models.UploadedImageModel = imagespace.models.ImageModel.extend({
    core_fields: ['id', '_version_', 'segment', 'digest', 'boost', 'host', 'url', 'content', 'title', 'cache', 'tstamp', 'host', 'contentType', 'mainType', 'subType', 'indexedAt', 'persons', 'persons_ts', 'weaponnames', 'weaponnames_ts', 'weapontypes', 'weapontypes_ts', 'phonenumbers', 'phonenumbers_ts', 'locations', 'locations_ts', 'organizations', 'organizations_ts', 'dates', 'cities', 'states', 'countries', 'location_geos', 'location_latlons', 'outlinks', 'outpaths'],

    initialize: function () {
        this._setApplicableSearches();
        this._updateTikaMapping();
    },

    /**
     * Core fields start with an underscore, exist in
     * this.core_fields, or are set by ImageSpace itself (such
     * as imageUrl, and histogram).
     **/
    isCoreField: function (field) {
        return _.any([
            field.indexOf('_') === 0,
            _.contains(this.core_fields, field),
            _.contains(['imageUrl', 'histogram', 'item_id', 'fields_mapped'], field)
        ]);
    },

    naiveGetType: function (value) {
        if ((_.isNumber(value) && (value % 1 === 0)) || (_.isString(value) && value.match(/^\d+$/))) {
            return 'l';
        } else if (_.isBoolean(value) || (_.isString(value) && value.match(/^(true|false)$/))) {
            return 'b';
        } else if (_.isNumber(value) || (_.isString(value) && value.match(/^[+-]?\d+(\.\d+)?$/))) {
            return 'd';
        } else if (_.isArray(value)) {
            // Very naive, assumes first item is the same type as all items in the array
            // Also assumes there will never be nested arrays.
            return this.naiveGetType(_.first(value)) + 's';
        } else {
            return 't';
        }
    },

    mapFieldName: function (field) {
        if (this.isCoreField(field)) {
            return field;
        } else {
            return field.replace('tiff_', 'tiff:').replace(/\s+/g, '').replace(/_+/g, '').toLowerCase() +
                '_' + this.naiveGetType(this.get(field)) + '_md';
        }
    },

    _updateTikaMapping: function () {
        if (!this.has('fields_mapped') || !this.get('fields_mapped')) {
            var tikaFields = _.reject(_.keys(this.attributes), _.bind(this.isCoreField, this));

            _.each(tikaFields, function (field) {
                this.set(this.mapFieldName(field), this.get(field));
                this.unset(field);
            }, this);

            this.set('fields_mapped', true);
        }
    }
});
