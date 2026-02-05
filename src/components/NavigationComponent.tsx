import { INavigationResultInfo } from '@mapplus/react-native-webmap';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');


interface NavigationComponentProps {
    navdata:INavigationResultInfo | undefined

}

const styles = StyleSheet.create({
  container: {
    // zIndex:9999,
    position: 'absolute',
    height: '100%',
    width: '100%'
    // backgroundColor: '#f8f9fa'
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  speed: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40, // 宽度和高度的一半
    backgroundColor: '#000000CC', // 可自定义背景色
    flex: 1,
    justifyContent: 'center',   // 垂直居中
    alignItems: 'center'
  },

    curStreet: {
    position: 'absolute',
   
   bottom: 50,
    width: '100%',
    height: 30,
    flex: 1,
    justifyContent: 'center',   // 垂直居中
    alignItems: 'center'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  turnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e'
  },
  roadText: {
    fontSize: 14,
    color: '#424242',
    marginTop: 4
  },
  summaryText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500'
  }
});

export default function NavigationComponent(props: NavigationComponentProps){

     type  NavData = {
        curRoad:string,
        nextTurn: string,
        nextRoad: string,
        nextDistance: string,
        nextTime: string,
        totalDistance: string,
        totalTime: string
        progress:string
        speed:string
    };

    const  navDataTmp:NavData = {
        nextTurn: '左转',
        nextRoad: '科技南路',
        nextDistance: '150米',
        nextTime: '2分钟',
        totalDistance: '3.8公里',
        totalTime: '10分钟',
        progress:'0%',
        speed:'60km/h',
        curRoad:''
    };
    const [navData ,setNavData] = useState<NavData | undefined>(navDataTmp)
    const [show ,setShow] = useState<boolean>(false)

    useEffect(()=>{
      if(props.navdata !== undefined){
        if(props.navdata?.turnType === 'straight'){
            navDataTmp.nextTurn = '直行'
        }else if(props.navdata?.turnType === 'turnLeft'){
            navDataTmp.nextTurn = '左转'
        }else if(props.navdata?.turnType === 'turnRight'){
            navDataTmp.nextTurn = '右转'
        }else if(props.navdata?.turnType === 'turnFrontLeft'){
            navDataTmp.nextTurn = '左前方'
        }else if(props.navdata?.turnType === 'turnBackLeft'){
            navDataTmp.nextTurn = '左后方'
        }else if(props.navdata?.turnType === 'turnBackRight'){
            navDataTmp.nextTurn = '右后方'
        }else if(props.navdata?.turnType === 'turnFrontRight'){
            navDataTmp.nextTurn = '右前方'
        }else if(props.navdata?.turnType === 'turnAround'){
            navDataTmp.nextTurn = '掉头'
        }
        navDataTmp.nextRoad = props.navdata.nextStreeName 

        navDataTmp.nextDistance = Math.round(props.navdata.remainingDistanceNextTurn) + '米'
        if(props.navdata.remainingDistanceNextTurn > 1000){
          navDataTmp.nextDistance = Math.round(props.navdata.remainingDistanceNextTurn / 1000) + '千米'
        }


        navDataTmp.nextTime =  '小于1分钟'
        if(props.navdata.remainingTimeNextTurn  > 60)
          navDataTmp.nextTime = Math.round(props.navdata.remainingTimeNextTurn / 60) + '分钟'
        if (props.navdata.remainingTimeNextTurn > 3600) {
          navDataTmp.nextTime = Math.round(props.navdata.remainingTimeNextTurn / 3600) + '小时' +
            Math.round(props.navdata.remainingTimeNextTurn % 3600 / 60) + '分钟'
        }


        navDataTmp.totalDistance = Math.round(props.navdata.remainingDistance) + '米'
        if(props.navdata.remainingDistance > 1000){
          navDataTmp.totalDistance = Math.round(props.navdata.remainingDistance / 1000) + '千米'
        }

        navDataTmp.totalTime =  '1分钟'
        if(props.navdata.remainingTime > 60)
          navDataTmp.totalTime = Math.round(props.navdata.remainingTime / 60) + '分钟'
        
        if (props.navdata.remainingTime > 3600) {
          navDataTmp.totalTime = Math.round(props.navdata.remainingTime / 3600) + '小时' +
            Math.round(props.navdata.remainingTime % 3600 / 60) + '分钟'
        }
        navDataTmp.progress = Math.round(props.navdata.progress * 100) + '%'
        navDataTmp.speed = Math.round(props.navdata.speed * 3.6) + ''
        navDataTmp.curRoad = props.navdata.curStreeName
        setNavData(navDataTmp)
       setShow(true)
      }else{
         setNavData(undefined)
        setShow(false)
      }
        

      
       
    },[props.navdata])


  

    if(navData === undefined || show === false){
        return <View></View>
    }
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.turnText}>{ '前方 ' + navData.nextTurn + ' 进入 '}</Text>
        <Text style={styles.roadText}>
          { navData.nextRoad} · {navData.nextDistance} · {navData.nextTime}
        </Text>
      </View>

      <View style={styles.speed}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#ffffff'
        }}>{navData.speed}</Text>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#ffffff'
        }}>{'km/h'}</Text>
      </View>

      <View style={styles.curStreet}>
        <View style={
          {
            height:'100%',
            width: 100,
            borderRadius: 20, // 宽度和高度的一半
            backgroundColor: '#1e88e5', // 可自定义背景色
            flex: 1,
            justifyContent: 'center',   // 垂直居中
            alignItems: 'center'
          }
        }>
          <Text style={{
            fontSize: 16,
            // fontWeight: 'bold',
            color: '#ffffff'
          }}>{navData.curRoad}</Text>
        </View>
     
      
      </View>
      <View style={styles.bottomBar}>
        <Text style={styles.summaryText}>
          全程剩余 {navData.totalDistance} · 约 {navData.totalTime} 后到达      进度:{navData.progress}
        </Text>
      </View>
    </View>
  );


}
// const NavigationComponent = () => {

//   const navData = {
//     nextTurn: '左转',
//     nextRoad: '科技南路',
//     nextDistance: '150米',
//     nextTime: '2分钟',
//     totalDistance: '3.8公里',
//     totalTime: '10分钟'
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.topBar}>
//         <Text style={styles.turnText}>{ navData.nextTurn + ' 进入 '}</Text>
//         <Text style={styles.roadText}>
//           { navData.nextRoad} · {navData.nextDistance} · {navData.nextTime}
//         </Text>
//       </View>

//       <View style={styles.bottomBar}>
//         <Text style={styles.summaryText}>
//           剩余 {navData.totalDistance} · 约 {navData.totalTime}
//         </Text>
//       </View>
//     </View>
//   );
// };



// export default NavigationComponent;