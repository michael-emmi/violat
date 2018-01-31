/*
 * Copyright (c) 2005, 2016, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
package org.openjdk.jcstress.infra.results;

import org.openjdk.jcstress.annotations.Result;

import java.io.Serializable;

@Result
public class StringResult8 implements Serializable {

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r1;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r2;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r3;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r4;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r5;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r6;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r7;

    @sun.misc.Contended
    @jdk.internal.vm.annotation.Contended
    public String r8;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        StringResult8 that = (StringResult8) o;

        if (r1 != null ? !r1.equals(that.r1) : that.r1 != null) return false;
        if (r2 != null ? !r2.equals(that.r2) : that.r2 != null) return false;
        if (r3 != null ? !r3.equals(that.r3) : that.r3 != null) return false;
        if (r4 != null ? !r4.equals(that.r4) : that.r4 != null) return false;
        if (r5 != null ? !r5.equals(that.r5) : that.r5 != null) return false;
        if (r6 != null ? !r6.equals(that.r6) : that.r6 != null) return false;
        if (r7 != null ? !r7.equals(that.r7) : that.r7 != null) return false;
        if (r8 != null ? !r8.equals(that.r8) : that.r8 != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = r1 != null ? r1.hashCode() : 0;
        result = 31 * result + (r2 != null ? r2.hashCode() : 0);
        result = 31 * result + (r3 != null ? r3.hashCode() : 0);
        result = 31 * result + (r4 != null ? r4.hashCode() : 0);
        result = 31 * result + (r5 != null ? r5.hashCode() : 0);
        result = 31 * result + (r6 != null ? r6.hashCode() : 0);
        result = 31 * result + (r7 != null ? r7.hashCode() : 0);
        result = 31 * result + (r8 != null ? r8.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return r1 + ", " + r2 + ", " + r3 + ", " + r4 + ", " + r5 + ", " + r6 + ", " + r7 + ", " + r8;
    }

}
