let changeProperty = (e) => {
    WGMap.getLayerById('editLayer')
        .getSource()
        .getFeatures()
        .filter((feature) => feature.values_['OGR_FID'] == wfst.getSelectFeatureId())[0].values_[
        e.target.id
    ] = e.target.value

    console.log(e.target.value)
}