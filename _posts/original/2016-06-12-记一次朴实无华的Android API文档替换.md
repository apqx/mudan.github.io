---
layout: post
categories: original
title: "记一次朴实无华的Android API文档替换"
author: 立泉
mention: GFW Java
date: 2016-06-12 +0800
description: 使用浏览器查看本地Android SDK里的API文档，发现其在联网状态下加载速度极慢，而如果断开网络就正常了🤔。
cover: 
tags: Code Android Java GFW
---

学习`Android`的过程中要参阅系统提供的应用开发接口`API`来实现所需功能，实际上在本地`Android SDK`中就有一份`HTML`版本的`API`文档。但是当我用浏览器打开时却发现它们在联网状态下加载速度极慢，而断开网络则是正常的。考虑到墙的存在，应该是页面中有些需要联网下载的`StyleSheet`或`Javascript`，而要连接的域名十有八九就是`Google`。

排查一番，加载缓慢的元凶是下面这段代码：

```html
<script src="http://www.google.com/jsapi" type="text/javascript"></script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-5831155-1', 'android.com');
  ga('create', 'UA-49880327-2', 'android.com', {'name': 'universal'});  // New tracker);
  ga('send', 'pageview');
  ga('universal.send', 'pageview'); // Send page view for new tracker.
</script>
```

似乎是`Google Analytics`网站统计工具，“正常”情况下无法访问的远程资源使浏览器等待响应直至超时，造成加载缓慢的现象，删除即可。

写一个小程序扫描这几千个`HTML`文档，发现含有以上代码就删除，然后输出回原文件。单线程处理是一个费时操作，不过我并不赶时间☕️。

```java
package me.apqx.util;

import java.awt.*;
import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by apqx on 2016/6/11.
 * 删除Android API文档中需要链接Google的Javascript代码
 */
public class ChangeFile {
    public static void main(String[] args) {
        // 文档所在的文件夹
        File file = new File("F:/docs");
        scanFile(file);
    }

    private static void scanFile(File file) {
        if (file.isDirectory()){
            File[] list = file.listFiles(new FileFilter() {
                @Override
                public boolean accept(File file) {
                    return file.isDirectory() || file.getName().contains("html");
                }
            });
            for (File f:list){
                // 递归
                scanFile(f);
            }
        } else {
            changeContent(file);
        }
    }
    
    private static void changeContent(File file){
        BufferedReader bufferedReader = null;
        BufferedWriter bufferedWriter = null;
        try {
            bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
            StringBuilder stringBuilder = new StringBuilder();
            String string;
            while ((string = bufferedReader.readLine()) != null){
                stringBuilder.append(string + "\n");
            }
            string = stringBuilder.toString();
            Matcher matcher = Pattern.compile("(<script .*http.*></script>)|((?s)<script>\n.*tracker\\.\n</script>)").matcher(string);
            if (matcher.find()) {
                string = matcher.replaceAll("");
            }
            bufferedWriter = new BufferedWriter(new FileWriter(file));
            bufferedWriter.write(string);
            System.out.println("已处理：" + file.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                bufferedReader.close();
                bufferedWriter.close();
            } catch (Exception e){
                e.printStackTrace();
            }
        }
    }
}
```