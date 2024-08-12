import * as Cesium from 'cesium';

export default class Zoom {
  viewer: Cesium.Viewer;
  constructor(_viewer: Cesium.Viewer) {
    this.viewer = _viewer;
  }

  /* 获取camera高度  */
  getHeight() {
    if (this.viewer) {
      let height = this.viewer.camera.positionCartographic.height;
      return height;
    }
  }
  /* 获取camera中心点坐标 */
  getCenterPosition() {
    var result = this.viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(
        this.viewer.canvas.clientWidth / 2,
        this.viewer.canvas.clientHeight / 2 + 200,
      ),
    );
    var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result!);
    var lon = (curPosition.longitude * 180) / Math.PI;
    var lat = (curPosition.latitude * 180) / Math.PI;
    var height = this.getHeight();
    return {
      lon: lon,
      lat: lat,
      height: height,
    };
  }

  /* 地图放大 */
  big(num: number = 1.8) {
    // 镜头拉进
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        this.getCenterPosition().lon,
        this.getCenterPosition().lat,
        this.getCenterPosition().height! / num,
      ),
      duration: 1.0,
    });
  }
  /* 地图缩小 */
  small(num: number = 1.8) {
    // 镜头远离
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        this.getCenterPosition().lon,
        this.getCenterPosition().lat,
        this.getCenterPosition().height! * num,
      ),
      duration: 1.0,
    });
  }
}
